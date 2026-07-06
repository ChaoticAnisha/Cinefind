// src/config/db.ts
// Creates a single shared Prisma client instance.
// We import this wherever we need to query the database.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['error'],  // only log errors, not every query
})

export default prisma