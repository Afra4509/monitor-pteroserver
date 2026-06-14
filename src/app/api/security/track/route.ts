import { NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { action, path } = await request.json(); // action = "enter" or "leave"
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    if (!action || !['enter', 'leave'].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await initDb();
    const db = getDb();

    await db.query(`
      INSERT INTO visitor_logs (ip, user_agent, action, path)
      VALUES (?, ?, ?, ?)
    `, [ip, userAgent, action, path || '/']);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to track visit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
