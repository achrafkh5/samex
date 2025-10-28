import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_TOKEN_NAME = 'admin_auth_token';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    
    // Delete the admin auth cookie
    cookieStore.delete(ADMIN_TOKEN_NAME);

    return NextResponse.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
