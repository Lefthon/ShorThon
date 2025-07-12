import mongoose from 'mongoose';

const shortLinkSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  clicks: {
    type: Number,
    default: 0
  }
});

const fileUploadSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  storedName: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  downloads: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    required: true
  }
});

export const ShortLink = mongoose.models.ShortLink || mongoose.model('ShortLink', shortLinkSchema);
export const FileUpload = mongoose.models.FileUpload || mongoose.model('FileUpload', fileUploadSchema);
