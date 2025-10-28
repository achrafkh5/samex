import { NextResponse } from 'next/server';
import Admin from '@/app/models/Admin';
import { validateEmail, validatePassword, validateFullName } from '@/app/lib/adminAuth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fullName, email, password } = body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate full name
    if (!validateFullName(fullName)) {
      return NextResponse.json(
        { error: 'Full name must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmailAdmin = await Admin.findByEmail(email);
    if (existingEmailAdmin) {
      return NextResponse.json(
        { error: 'An admin with this email already exists' },
        { status: 409 }
      );
    }

    // Check if full name already exists
    const existingNameAdmin = await Admin.findByFullName(fullName);
    if (existingNameAdmin) {
      return NextResponse.json(
        { error: 'An admin with this full name already exists' },
        { status: 409 }
      );
    }

    // Create new admin
    const newAdmin = await Admin.create({
      fullName,
      email,
      password
    });

    // Remove password hash from response
    const { passwordHash, ...adminData } = newAdmin;

    return NextResponse.json(
      {
        message: 'Admin account created successfully',
        admin: adminData
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin account' },
      { status: 500 }
    );
  }
}
