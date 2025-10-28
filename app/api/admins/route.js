import { NextResponse } from 'next/server';
import { getAuthAdmin } from '@/app/lib/adminAuth';
import Admin from '@/app/models/Admin';

/**
 * GET /api/admins
 * Fetch all admins (authenticated admins only)
 * Returns list of admins without sensitive data
 */
export async function GET(request) {
  try {
    // Check authentication
    const authAdmin = await getAuthAdmin(request);
    
    if (!authAdmin) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch all admins
    const admins = await Admin.getAll();

    return NextResponse.json(admins, { status: 200 });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}
