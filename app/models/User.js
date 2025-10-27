import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'users';

/**
 * User Model for MongoDB operations
 */
class UserModel {
  /**
   * Get MongoDB collection
   */
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    return db.collection(COLLECTION_NAME);
  }

  /**
   * Create a new user
   * @param {object} userData - User data
   * @returns {Promise<object>} - Created user
   */
  static async create(userData) {
    const collection = await this.getCollection();
    
    const user = {
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(user);
    
    return {
      _id: result.insertedId,
      ...user,
    };
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<object|null>} - User or null
   */
  static async findByEmail(email) {
    const collection = await this.getCollection();
    return collection.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<object|null>} - User or null
   */
  static async findById(id) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {object} updateData - Data to update
   * @returns {Promise<object|null>} - Updated user
   */
  static async update(id, updateData) {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );

    return result.value;
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} - Success status
   */
  static async delete(id) {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  /**
   * Check if email exists
   * @param {string} email - User email
   * @returns {Promise<boolean>} - True if exists
   */
  static async emailExists(email) {
    const user = await this.findByEmail(email);
    return !!user;
  }

  /**
   * Get user without password
   * @param {object} user - User object
   * @returns {object} - User without password hash
   */
  static sanitizeUser(user) {
    if (!user) return null;
    
    const { passwordHash, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      _id: user._id.toString(),
    };
  }
}

export default UserModel;
