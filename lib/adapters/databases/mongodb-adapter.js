import DatabaseAdapter from './database-adapter.js';

export default class MongoDBAdapter extends DatabaseAdapter {
  constructor(collection) {
    super();
    this.collection = collection;
  }

  async findUserByEmail(email) {
    return this.collection.findOne({ email });
  }

  async createUser(userData) {
    const result = await this.collection.insertOne(userData);
    return { ...userData, _id: result.insertedId };
  }
}