import DatabaseAdapter from './database-adapter.js';

export default class SupabaseAdapter extends DatabaseAdapter {
  constructor(client) {
    super();
    this.client = client;
  }

  async findUserByEmail(email) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    return error ? null : data;
  }

  async createUser(userData) {
    const { data, error } = await this.client
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}