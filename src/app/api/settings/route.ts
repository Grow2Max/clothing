import { NextResponse } from "next/server";
import { seedData } from "@/lib/seed-data";

// DEMO: store details come from src/lib/seed-data.ts (fictional), never from the
// database, and saving in Admin → Settings does not write to the database.
export async function GET() {
  return NextResponse.json(seedData.settings);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  return NextResponse.json({ ...seedData.settings, ...body });
}
