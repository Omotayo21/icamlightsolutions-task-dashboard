import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true }, // custom name entered by user
  originalName: { type: String, default: '' },
  cloudinaryUrl: { type: String, required: true }, // full Cloudinary URL
  publicId: { type: String, required: true }, // Cloudinary public_id for possible deletion
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});


export default mongoose.models.File || mongoose.model('File', fileSchema);
