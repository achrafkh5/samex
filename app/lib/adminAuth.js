import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_TOKEN_NAME = 'admin_auth_token';

// Password hashing
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Password comparison
export async function comparePasswords(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Generate JWT token for admin
export function generateAdminToken(adminData) {
  return jwt.sign(
    {
      adminId: adminData._id.toString(),
      email: adminData.email,
      fullName: adminData.fullName,
      role: 'admin'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Get admin token from request
export async function getAdminTokenFromRequest(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_TOKEN_NAME);
    return token?.value || null;
  } catch (error) {
    console.error('Error getting admin token:', error);
    return null;
  }
}

// Get authenticated admin from request
export async function getAuthAdmin(request) {
  try {
    const token = await getAdminTokenFromRequest(request);
    
    if (!token) {
      return null;
    }

    const decoded = verifyAdminToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Error getting authenticated admin:', error);
    return null;
  }
}

// Validation functions
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  // At least 8 characters
  return password && password.length >= 8;
}

export function validateFullName(fullName) {
  // At least 3 characters
  return fullName && fullName.trim().length >= 3;
}

// Sanitize admin data (remove sensitive info)
export function sanitizeAdmin(admin) {
  const { passwordHash, ...sanitized } = admin;
  return sanitized;
}
