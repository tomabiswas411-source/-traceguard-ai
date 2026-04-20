import { NextRequest, NextResponse } from 'next/server';
import { createUser, createSession } from '@/lib/auth';
import { db } from '@/lib/db';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 100;

export async function POST(request: NextRequest) {
  try {
    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type. Expected application/json' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password length
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be less than ${MAX_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Validate name if provided
    if (name !== undefined && name !== null) {
      if (typeof name !== 'string') {
        return NextResponse.json(
          { error: 'Invalid name format' },
          { status: 400 }
        );
      }
      if (name.length > MAX_NAME_LENGTH) {
        return NextResponse.json(
          { error: `Name must be less than ${MAX_NAME_LENGTH} characters` },
          { status: 400 }
        );
      }
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Create user and session
    const user = await createUser(normalizedEmail, password, name?.trim());
    const session = await createSession(user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: 'Registration successful',
    });

    // Set session cookie
    response.cookies.set('session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
