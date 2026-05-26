import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '@/lib/db';
import FileModel from '@/lib/models/file';
import { getAuthenticatedUser } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const uploadedFile = formData.get('file');
    const name = formData.get('name');

    if (!uploadedFile || !name) {
      return NextResponse.json(
        { error: 'Both a file and a name are required.' },
        { status: 400 }
      );
    }

    // Check if uploadedFile is a Web API File/Blob
    if (typeof uploadedFile !== 'object' || !(uploadedFile.stream && typeof uploadedFile.arrayBuffer === 'function')) {
      return NextResponse.json({ error: 'Invalid file upload' }, { status: 400 });
    }

    const originalName = uploadedFile.name || '';
    const mimeType = uploadedFile.type || 'application/octet-stream';
    const size = uploadedFile.size || 0;

    const arrayBuffer = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'auto', folder: 'icamlightsolutions' },
          (error, result) => (error ? reject(error) : resolve(result))
        )
        .end(buffer);
    });

    await dbConnect();
    const doc = await FileModel.create({
      name,
      originalName,
      cloudinaryUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      mimeType,
      size,
      uploadedAt: new Date(),
    });

    return NextResponse.json({ success: true, file: doc });
  } catch (err) {
    console.error('[upload] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
