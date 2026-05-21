import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/lib/models/Task';
import ActivityLog from '@/lib/models/ActivityLog';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { title, status, isArchived, week, category, assignedStaff, updatedBy } = body;

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const previousStatus = task.status;
    const previousTitle = task.title;

    // Apply updates
    if (title !== undefined && title.trim()) task.title = title.trim();
    if (status !== undefined) task.status = status;
    if (isArchived !== undefined) task.isArchived = isArchived;
    if (week !== undefined) task.week = week;
    if (category !== undefined) task.category = category;
    if (assignedStaff !== undefined) task.assignedStaff = assignedStaff;

    await task.save();

    // Log the activity
    let details = `updated task "${task.title}"`;
    let action = 'Update Task';

    if (title !== undefined && title.trim() !== previousTitle) {
      action = 'Edit Task';
      details = `renamed task to "${task.title}"`;
    } else if (status !== undefined && status !== previousStatus) {
      action = `Task ${status}`;
      details = `marked task "${task.title}" as ${status.toLowerCase()}`;
    }

    await ActivityLog.create({
      action,
      details,
      performedBy: updatedBy || 'System'
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('API Tasks ID PUT error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
