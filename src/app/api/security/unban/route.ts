import { NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("cookie");
    if (!authHeader?.includes("auth_token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ip } = await request.json();

    if (!ip) {
      return NextResponse.json({ error: "IP is required" }, { status: 400 });
    }

    await initDb();
    const db = getDb();

    // Delete the IP block
    await db.query('DELETE FROM ip_blocks WHERE ip = ?', [ip]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unban IP:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
