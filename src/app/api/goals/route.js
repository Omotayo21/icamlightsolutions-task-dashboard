import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Goal from '@/lib/models/Goal';
import ActivityLog from '@/lib/models/ActivityLog';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    if (!month) {
      return NextResponse.json({ error: 'Month parameter is required' }, { status: 400 });
    }

    const goals = await Goal.find({ month, isArchived: false }).sort({ createdAt: 1 });
    return NextResponse.json(goals);
  } catch (error) {
    console.error('API Goals GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { title, month, createdBy } = body;

    if (!title || !month || !createdBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newGoal = await Goal.create({
      title,
      month,
      createdBy
    });

    await ActivityLog.create({
      action: 'Create Goal',
      details: `added a monthly goal: "${title}"`,
      performedBy: createdBy
    });

    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error('API Goals POST error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, status, updatedBy } = body;

    if (!id || !status || !updatedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const goal = await Goal.findById(id);
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const oldStatus = goal.status;
    goal.status = status;
    await goal.save();

    let details = `updated goal "${goal.title}"`;
    if (status === 'Completed' && oldStatus !== 'Completed') {
      details = `completed monthly goal: "${goal.title}"`;
    } else if (status === 'Pending' && oldStatus === 'Completed') {
      details = `reopened monthly goal: "${goal.title}"`;
    }

    await ActivityLog.create({
      action: 'Update Goal',
      details,
      performedBy: updatedBy
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('API Goals PUT error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}
