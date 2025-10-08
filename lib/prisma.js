const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');

// Create a custom Prisma client that works with Turso
class TursoPrismaClient extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
}

// Create the client instance
const prisma = new TursoPrismaClient();

module.exports = prisma;
