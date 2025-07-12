import { connectToDB } from '../../lib/database';
import { FileUpload } from '../../lib/models';
import { storage } from '../../lib/storage';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === 'POST') {
    // Handle file upload
    try {
      const formData = await new Promise((resolve, reject) => {
        const form = new multiparty.Form();
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve({ fields, files });
        });
      });

      const uploadedFile = formData.files.file[0];
      
      // Upload to Vercel Blob (or alternative storage)
      const blob = await storage.put(
        `${crypto.randomBytes(8).toString('hex')}-${uploadedFile.originalFilename}`,
        fs.createReadStream(uploadedFile.path),
        {
          contentType: uploadedFile.headers['content-type'],
        }
      );

      const shortCode = crypto.randomBytes(6).toString('hex');
      
      const fileUpload = new FileUpload({
        originalName: uploadedFile.originalFilename,
        storedName: blob.url,
        shortCode,
        size: uploadedFile.size
      });
      
      await fileUpload.save();
      
      res.json({
        downloadUrl: `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}/f/${shortCode}`,
        fileName: uploadedFile.originalFilename,
        size: formatFileSize(uploadedFile.size)
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    // Handle download
    try {
      const { code } = req.query;
      const fileUpload = await FileUpload.findOne({ shortCode: code });
      
      if (!fileUpload) {
        return res.status(404).send('File not found');
      }
      
      fileUpload.downloads++;
      await fileUpload.save();
      
      const blob = await storage.get(fileUpload.storedName);
      res.setHeader('Content-Type', blob.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileUpload.originalName}"`);
      blob.body.pipe(res);
    } catch (err) {
      res.status(500).send('Server error');
    }
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                        }
