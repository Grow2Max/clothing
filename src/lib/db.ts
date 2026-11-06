import { promises as fs } from "fs";
import path from "path";
import type { StoreData } from "./types";
import { seedData } from "./seed-data";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(seedData, null, 2), "utf-8");
  }
}

export async function readStore(): Promise<StoreData> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as StoreData;
}

export async function writeStore(data: StoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function mutate<T>(fn: (data: StoreData) => T): Promise<T> {
  const data = await readStore();
  const result = fn(data);
  await writeStore(data);
  return result;
}
