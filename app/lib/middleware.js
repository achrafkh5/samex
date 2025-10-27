import { NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';

/**
 * Middleware to protect API routes that require authentication
 * @param {Function} handler - API route handler
 * @returns {Function} - Wrapped handler with auth check
 */
export function withAuth(handler) {
  return async (request, context) => {
    const user = getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }
    
    // Add user to request for handler to use
    request.user = user;
    
    return handler(request, context);
  };
}

/**
 * Middleware to check if user is already authenticated
 * Used for redirecting from login/signup pages
 * @param {Function} handler - API route handler
 * @returns {Function} - Wrapped handler with guest check
 */
export function withGuest(handler) {
  return async (request, context) => {
    const user = getAuthUser(request);
    
    if (user) {
      return NextResponse.json(
        { error: 'Already authenticated', redirectTo: '/dashboard' },
        { status: 302 }
      );
    }
    
    return handler(request, context);
  };
}
