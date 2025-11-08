import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'transitaires';

/**
 * Transitaire Model for MongoDB operations
 */
class TransitaireModel {
  /**
   * Get MongoDB collection
   */
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    return db.collection(COLLECTION_NAME);
  }

  /**
   * Create a new transitaire
   * @param {object} transitaireData - Transitaire data
   * @returns {Promise<object>} - Created transitaire
   */
  static async create(transitaireData) {
    const collection = await this.getCollection();
    
    const transitaire = {
      num_agrement: transitaireData.num_agrement,
      nom_ou_raison_sociale: transitaireData.nom_ou_raison_sociale,
      nif: transitaireData.nif,
      wilaya: transitaireData.wilaya,
      represente_par: transitaireData.represente_par || '',
      pdfUrl: transitaireData.pdfUrl || null,
      cloudinaryPublicId: transitaireData.cloudinaryPublicId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(transitaire);
    
    return {
      _id: result.insertedId,
      ...transitaire,
    };
  }

  /**
   * Find all transitaires
   * @returns {Promise<Array>} - List of transitaires
   */
  static async findAll() {
    const collection = await this.getCollection();
    return collection.find({}).sort({ nom_ou_raison_sociale: 1 }).toArray();
  }

  /**
   * Find transitaire by ID
   * @param {string} id - Transitaire ID
   * @returns {Promise<object|null>} - Transitaire or null
   */
  static async findById(id) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  }

  /**
   * Update transitaire
   * @param {string} id - Transitaire ID
   * @param {object} updateData - Data to update
   * @returns {Promise<object|null>} - Updated transitaire
   */
  static async update(id, updateData) {
    const collection = await this.getCollection();
    
    try {
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...updateData,
            updatedAt: new Date() 
          } 
        }
      );

      if (result.matchedCount === 0) {
        return null;
      }

      // Fetch and return the updated document
      return await collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error('Error in TransitaireModel.update:', error);
      throw error;
    }
  }

  /**
   * Delete transitaire
   * @param {string} id - Transitaire ID
   * @returns {Promise<boolean>} - Success status
   */
  static async delete(id) {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  /**
   * Find transitaire by num_agrement
   * @param {string} num_agrement - Agreement number
   * @returns {Promise<object|null>} - Transitaire or null
   */
  static async findByNumAgrement(num_agrement) {
    const collection = await this.getCollection();
    return collection.findOne({ num_agrement });
  }

  /**
   * Check if num_agrement exists
   * @param {string} num_agrement - Agreement number
   * @returns {Promise<boolean>} - True if exists
   */
  static async numAgrementExists(num_agrement) {
    const transitaire = await this.findByNumAgrement(num_agrement);
    return !!transitaire;
  }
}

export default TransitaireModel;
