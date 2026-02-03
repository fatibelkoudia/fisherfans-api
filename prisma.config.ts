import "dotenv/config";
import fs from "node:fs";
import { defineConfig, env } from "prisma/config";

const databaseUrl = env("DATABASE_URL");
const resolvedDatabaseUrl =
  !fs.existsSync("/.dockerenv") && databaseUrl.includes("@postgres:")
    ? databaseUrl.replace("@postgres:", "@localhost:")
    : databaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  engine: "classic",
  datasource: {
    url: resolvedDatabaseUrl,
  },
});
