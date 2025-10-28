import { NextResponse } from 'next/server';
import Admin from '@/app/models/Admin';
import { comparePasswords, generateAdminToken, sanitizeAdmin } from '@/app/lib/adminAuth';
import { cookies } from 'next/headers';

const ADMIN_TOKEN_NAME = 'admin_auth_token';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find admin by email
    const admin = await Admin.findByEmail(email);
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare passwords
    const isPasswordValid = await comparePasswords(password, admin.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateAdminToken(admin);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    // Return sanitized admin data
    const adminData = sanitizeAdmin(admin);

    return NextResponse.json({
      message: 'Login successful',
      admin: adminData
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
