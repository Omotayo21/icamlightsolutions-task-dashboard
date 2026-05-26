import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Goal from '@/lib/models/Goal';
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
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { title, month } = body;

    if (!title || !month) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newGoal = await Goal.create({
      title,
      month,
      createdBy: authUser.name
    });

    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error('API Goals POST error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const goal = await Goal.findById(id);
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    goal.status = status;
    await goal.save();

    return NextResponse.json(goal);
  } catch (error) {
    console.error('API Goals PUT error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}
