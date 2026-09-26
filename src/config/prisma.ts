import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";

// DATABASE_URL is "file:./dev.db" — strip the "file:" prefix for the adapter
const dbUrl = process.env["DATABASE_URL"] ?? "file:/data/prod.db";
const dbPath = dbUrl.replace(/^file:/, "");

const adapter = new PrismaBetterSqlite3({
  url: dbPath,
});

export const prisma = new PrismaClient({
  adapter,
});