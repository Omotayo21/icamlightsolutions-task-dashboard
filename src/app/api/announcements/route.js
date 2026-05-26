import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Announcement from '@/lib/models/Announcement';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const announcements = await Announcement.find({ isArchived: false })
      .sort({ createdAt: -1 })
      .limit(20);
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('API Announcements GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAnnouncement = await Announcement.create({
      title,
      content,
      createdBy: authUser.name
    });

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error('API Announcements POST error:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
