import { NextResponse } from 'next/server';
import { connectDB } from '@/lib';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    await connectDB();

    // Parse request body
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ ok: false,  message: 'Email and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ ok: false,  message: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({ name, email, password: hashedPassword });

    // Exclude password from response
    newUser.password = undefined;

    return NextResponse.json({ ok: true, message: 'User registered successfully', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
  }
}