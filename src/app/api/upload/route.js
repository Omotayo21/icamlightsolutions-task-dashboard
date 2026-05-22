import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '@/lib/db';
import File from '@/lib/models/file';

// Configure Cloudinary from .env.local
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    // Next.js App Router natively parses multipart/form-data — NO multer needed
    const formData = await request.formData();
    const file = formData.get('file');  // Web API File / Blob
    const name = formData.get('name'); 
    console.log('FILE DEBUG:', {
  type: typeof file,
  constructor: file?.constructor?.name,
  name: file?.name,
  keys: file ? Object.keys(file) : null,
})
    const originalName = file instanceof File ? file.name : (file?.name ?? '');
    if (!file || !name) {
      return NextResponse.json(
        { error: 'Both a file and a name are required.' },
        { status: 400 }
      );
    }

    // Convert Web API Blob → Node Buffer so we can pipe to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Stream buffer to Cloudinary (resource_type: 'auto' accepts any file type)
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'auto', folder: 'icamlightsolutions' },
          (error, result) => (error ? reject(error) : resolve(result))
        )
        .end(buffer);
    });

    // Save metadata to MongoDB
    await dbConnect();
    const doc = await File.create({
      name,
      originalName,  // ← add this
      cloudinaryUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date(),
    });
console.log('SAVED DOC:', JSON.stringify(doc.toObject(), null, 2));
    return NextResponse.json({ success: true, file: doc });
  } catch (err) {
    console.error('[upload] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
