import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/lib/models/Task';
import { getAuthenticatedUser } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { title, status, isArchived, week, category, assignedStaff } = body;

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (title !== undefined && title.trim()) task.title = title.trim();
    if (status !== undefined) task.status = status;
    if (isArchived !== undefined) task.isArchived = isArchived;
    if (week !== undefined) task.week = week;
    if (category !== undefined) task.category = category;
    if (assignedStaff !== undefined) task.assignedStaff = assignedStaff;

    await task.save();

    return NextResponse.json(task);
  } catch (error) {
    console.error('API Tasks ID PUT error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
