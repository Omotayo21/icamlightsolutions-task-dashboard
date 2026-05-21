/*import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ActivityLog from '@/lib/models/ActivityLog';

export async function GET() {
  try {
    await dbConnect();
    const logs = await ActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(30);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('API Logs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
*/