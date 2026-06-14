import { NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("cookie");
    if (!authHeader?.includes("auth_token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDb();
    const db = getDb();

    const [rows] = await db.query('SELECT * FROM ip_blocks ORDER BY updated_at DESC');

    return NextResponse.json({ blocks: rows });
  } catch (error) {
    console.error("Failed to fetch blocks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
