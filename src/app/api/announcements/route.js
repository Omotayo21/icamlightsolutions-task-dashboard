import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Announcement from '@/lib/models/Announcement';
import ActivityLog from '@/lib/models/ActivityLog';

export async function GET() {
  try {
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
    await dbConnect();
    const body = await request.json();
    const { title, content, createdBy } = body;

    if (!title || !content || !createdBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAnnouncement = await Announcement.create({
      title,
      content,
      createdBy
    });

    await ActivityLog.create({
      action: 'Post Announcement',
      details: `posted announcement: "${title}"`,
      performedBy: createdBy
    });

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error('API Announcements POST error:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
