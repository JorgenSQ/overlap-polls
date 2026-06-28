import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = path.join(root, "prisma", "schema.prisma");
const url = process.env.DATABASE_URL ?? "";

if (process.env.VERCEL === "1" && !url) {
  console.error("DATABASE_URL is required on Vercel");
  process.exit(1);
}

const provider = url.startsWith("file:") || !url ? "sqlite" : "postgresql";

let schema = fs.readFileSync(schemaPath, "utf8");
const pattern =
  /(datasource db \{[^}]*?provider\s*=\s*)"(sqlite|postgresql)"/s;
const next = schema.replace(pattern, `$1"${provider}"`);

if (next === schema) {
  console.warn("sync-prisma-provider: datasource provider not updated");
} else {
  fs.writeFileSync(schemaPath, next);
  console.log(`sync-prisma-provider: set datasource provider to ${provider}`);
}
