const { createClient } = require('@libsql/client');

// Create Turso client
const tursoClient = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Database adapter for Turso
class TursoDatabase {
  constructor() {
    this.client = tursoClient;
  }

  async execute(query, params = []) {
    try {
      const result = await this.client.execute(query, params);
      return result;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  async batch(statements) {
    try {
      const result = await this.client.batch(statements);
      return result;
    } catch (error) {
      console.error('Database batch error:', error);
      throw error;
    }
  }

  // User operations
  async createUser(userData) {
    const { id, name, email, emailVerified, image, password, pushSubscription } = userData;
    const query = `
      INSERT INTO User (id, name, email, emailVerified, image, password, pushSubscription, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    const params = [
      id, 
      name || null, 
      email, 
      emailVerified || null, 
      image || null, 
      password || null, 
      pushSubscription || null
    ];
    return await this.execute(query, params);
  }

  async findUserByEmail(email) {
    const query = 'SELECT * FROM User WHERE email = ?';
    const result = await this.execute(query, [email]);
    return result.rows[0] || null;
  }

  async findUserById(id) {
    const query = 'SELECT * FROM User WHERE id = ?';
    const result = await this.execute(query, [id]);
    return result.rows[0] || null;
  }

  // Analytics operations
  async createAnalytics(userId, eventType, eventData) {
    const query = `
      INSERT INTO UserAnalytics (id, userId, eventType, eventData, timestamp)
      VALUES (?, ?, ?, ?, datetime('now'))
    `;
    const id = `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return await this.execute(query, [id, userId, eventType, JSON.stringify(eventData)]);
  }

  async getAnalytics(userId, days = 7) {
    const query = `
      SELECT * FROM UserAnalytics 
      WHERE userId = ? AND timestamp >= datetime('now', '-${days} days')
      ORDER BY timestamp DESC
    `;
    const result = await this.execute(query, [userId]);
    return result.rows;
  }

  // Favorites operations
  async createFavorite(userId, itemId, itemType, itemData) {
    const query = `
      INSERT INTO UserFavorite (id, userId, itemId, itemType, itemData, createdAt)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `;
    const id = `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return await this.execute(query, [id, userId, itemId, itemType, JSON.stringify(itemData)]);
  }

  async getFavorites(userId) {
    const query = 'SELECT * FROM UserFavorite WHERE userId = ? ORDER BY createdAt DESC';
    const result = await this.execute(query, [userId]);
    return result.rows;
  }

  async deleteFavorite(userId, itemId, itemType) {
    const query = 'DELETE FROM UserFavorite WHERE userId = ? AND itemId = ? AND itemType = ?';
    return await this.execute(query, [userId, itemId, itemType]);
  }

  async close() {
    await this.client.close();
  }
}

// Create and export database instance
const database = new TursoDatabase();

module.exports = database;
