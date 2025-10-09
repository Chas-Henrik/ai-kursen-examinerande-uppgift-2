import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Session from '@/models/Session';
import jwt from 'jsonwebtoken';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();

  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    userId = decoded.userId;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { id } = params;

  try {
    const session = await Session.findOneAndDelete({ _id: id, userId });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting session' }, { status: 500 });
  }
}
