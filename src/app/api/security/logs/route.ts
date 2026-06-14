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

    // Get visitor logs (latest 100)
    const [rows] = await db.query('SELECT * FROM visitor_logs ORDER BY created_at DESC LIMIT 100');
    
    // Get total visitors count
    const [totalRows] = await db.query('SELECT COUNT(DISTINCT ip) as total FROM visitor_logs');
    const total = (totalRows as { total: number }[])[0].total;

    return NextResponse.json({ logs: rows, totalUniqueVisitors: total });
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
