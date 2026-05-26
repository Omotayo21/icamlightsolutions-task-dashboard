import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/lib/models/Task';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const isArchived = searchParams.get('isArchived') === 'true';

    const filter = { isArchived };
    if (month) {
      filter.month = month;
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('API Tasks GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
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
    const { title, description, assignedStaff, category, week, dueDate, month } = body;

    if (!title || !month) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTask = await Task.create({
      title,
      description,
      assignedStaff,
      category,
      week,
      dueDate,
      month,
      createdBy: authUser.name
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('API Tasks POST error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
