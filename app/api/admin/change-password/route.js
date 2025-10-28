import { NextResponse } from 'next/server';
import { getAuthAdmin, comparePasswords, hashPassword, validatePassword } from '@/app/lib/adminAuth';
import Admin from '@/app/models/Admin';

export async function PUT(request) {
  try {
    // Check authentication
    const authAdmin = await getAuthAdmin(request);
    
    if (!authAdmin) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { oldPassword, newPassword, confirmNewPassword } = body;

    // Validate required fields
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (!validatePassword(newPassword)) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { error: 'New passwords do not match' },
        { status: 400 }
      );
    }

    // Check if new password is different from old password
    if (oldPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from old password' },
        { status: 400 }
      );
    }

    // Fetch admin from database
    const admin = await Admin.findById(authAdmin.adminId);
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Verify old password
    const isOldPasswordValid = await comparePasswords(oldPassword, admin.passwordHash);
    
    if (!isOldPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in database
    const updated = await Admin.updatePassword(authAdmin.adminId, newPasswordHash);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
