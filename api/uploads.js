const express = require('express');
const router = express.Router();
const FileUpload = require('../models/FileUpload');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Konfigurasi Multer untuk handle upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${crypto.randomBytes(8).toString('hex')}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    // Validasi ekstensi file
    const allowedTypes = [
      'image/jpeg', 
      'image/png',
      'application/pdf',
      'application/zip',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('File type not allowed'));
    }
    cb(null, true);
  }
}).single('file');

// Handle upload file
router.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        error: err.message || 'Error uploading file' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const shortCode = crypto.randomBytes(6).toString('hex');
      
      const fileUpload = new FileUpload({
        originalName: req.file.originalname,
        storedName: req.file.filename,
        shortCode,
        size: req.file.size,
        mimeType: req.file.mimetype
      });

      await fileUpload.save();

      res.json({
        success: true,
        downloadUrl: `${req.protocol}://${req.get('host')}/f/${shortCode}`,
        fileName: req.file.originalname,
        fileSize: formatFileSize(req.file.size),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 hari kedepan
      });

    } catch (error) {
      // Hapus file jika gagal menyimpan ke database
      fs.unlinkSync(path.join(__dirname, '../../public/uploads', req.file.filename));
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// Handle download file
router.get('/:code', async (req, res) => {
  try {
    const fileUpload = await FileUpload.findOneAndUpdate(
      { shortCode: req.params.code },
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!fileUpload) {
      return res.status(404).send('File not found or expired');
    }

    const filePath = path.join(__dirname, '../../public/uploads', fileUpload.storedName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    res.set({
      'Content-Type': fileUpload.mimeType,
      'Content-Disposition': `attachment; filename="${fileUpload.originalName}"`,
      'Content-Length': fileUpload.size
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Format ukuran file
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = router;
