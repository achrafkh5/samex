import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { hashPassword, sanitizeAdmin } from '@/app/lib/adminAuth';

class Admin {
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db('dreamcars');
    return db.collection('admins');
  }

  // Create new admin
  static async create({ fullName, email, password }) {
    const collection = await this.getCollection();
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    const admin = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(admin);
    
    return {
      _id: result.insertedId,
      ...admin
    };
  }

  // Find admin by email
  static async findByEmail(email) {
    const collection = await this.getCollection();
    return await collection.findOne({ email: email.toLowerCase().trim() });
  }

  // Find admin by full name
  static async findByFullName(fullName) {
    const collection = await this.getCollection();
    return await collection.findOne({ fullName: fullName.trim() });
  }

  // Find admin by ID
  static async findById(id) {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  // Update admin password
  static async updatePassword(adminId, newPasswordHash) {
    const collection = await this.getCollection();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(adminId) },
      {
        $set: {
          passwordHash: newPasswordHash,
          updatedAt: new Date()
        }
      }
    );
    
    return result.modifiedCount > 0;
  }

  // Update admin profile
  static async update(adminId, updates) {
    const collection = await this.getCollection();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(adminId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );
    
    return result.modifiedCount > 0;
  }

  // Delete admin
  static async delete(adminId) {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(adminId) });
    return result.deletedCount > 0;
  }

  // Get all admins (without password hashes)
  static async getAll() {
    const collection = await this.getCollection();
    const admins = await collection.find({}).toArray();
    return admins.map(admin => sanitizeAdmin(admin));
  }

  // Count admins
  static async count() {
    const collection = await this.getCollection();
    return await collection.countDocuments();
  }
}

export default Admin;
