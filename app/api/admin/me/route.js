import { NextResponse } from 'next/server';
import { getAuthAdmin } from '@/app/lib/adminAuth';
import Admin from '@/app/models/Admin';

export async function GET(request) {
  try {
    const authAdmin = await getAuthAdmin(request);
    
    if (!authAdmin) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch full admin data from database
    const admin = await Admin.findById(authAdmin.adminId);
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Remove password hash
    const { passwordHash, ...adminData } = admin;

    return NextResponse.json({ admin: adminData });
  } catch (error) {
    console.error('Get admin error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}
