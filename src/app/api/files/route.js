import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import File from '@/lib/models/file';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    await dbConnect();

    const filter = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const files = await File.find(filter)
      .sort({ uploadedAt: -1 })
      .lean()
      .exec();

    const payload = files.map((f) => ({
      _id: f._id,
      name: f.name,
      originalName: f.originalName,
      cloudinaryUrl: f.cloudinaryUrl,
      mimeType: f.mimeType,
      size: f.size,
      uploadedAt: f.uploadedAt,
    }));

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[files] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
