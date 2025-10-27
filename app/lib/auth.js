import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
export async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token
 * @param {object} payload - Data to encode in token (e.g., user ID, email)
 * @returns {string} - JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Extract token from request cookies
 * @param {Request} request - Next.js request object
 * @returns {string|null} - Token or null
 */
export async function getTokenFromRequest(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    return token?.value || null;
  } catch (error) {
    console.error('Error getting token from cookies:', error);
    return null;
  }
}

/**
 * Get authenticated user from request
 * @param {Request} request - Next.js request object
 * @returns {object|null} - User data or null
 */
export async function getAuthUser(request) {
  const token = await getTokenFromRequest(request);
  if (!token) {
    console.log('No token found in cookies');
    return null;
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    console.log('Token verification failed');
  }
  return decoded;
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} - True if valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {object} - { valid: boolean, message: string }
 */
export function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true, message: '' };
}
