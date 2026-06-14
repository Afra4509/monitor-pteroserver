import { NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    let blockRecord = null;
    try {
      await initDb();
      const db = getDb();
      const [blockRows] = await db.query('SELECT * FROM ip_blocks WHERE ip = ?', [ip]);
      blockRecord = (blockRows as any[])[0];

      if (blockRecord) {
        if (blockRecord.is_banned) {
          return NextResponse.json({ error: "Access Denied: Your IP has been permanently banned due to suspicious activity." }, { status: 403 });
        }
        if (blockRecord.block_expires && new Date(blockRecord.block_expires) > new Date()) {
          return NextResponse.json({ error: "Access Denied: Too many failed attempts. Try again in 24 hours." }, { status: 429 });
        }
      }
    } catch (dbError) {
      console.warn("Database connection failed during IP check. Proceeding without IP blocks.", dbError);
    }

    let isValid = false;

    try {
      const [rows] = await db.query('SELECT password FROM users WHERE username = ?', ['admin']);
      const users = rows as any[];
      
      if (users.length > 0 && users[0].password === password) {
        isValid = true;
      }
    } catch (dbError) {
      console.warn("Database connection failed. Attempting local fallback...", dbError);
      if (password === "Mikasa29") {
        isValid = true;
      }
    }

    if (!isValid) {
      // Record failed attempt
      try {
        const db = getDb();
        if (blockRecord) {
          const newAttempts = blockRecord.failed_attempts + 1;
          let isBanned = false;
          let blockExpires = null;

          if (newAttempts >= 5) {
            isBanned = true;
          } else if (newAttempts >= 3) {
            blockExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          }

          await db.query(`
            UPDATE ip_blocks 
            SET failed_attempts = ?, is_banned = ?, block_expires = ?
            WHERE ip = ?
          `, [newAttempts, isBanned, blockExpires, ip]);
        } else {
          await db.query(`
            INSERT INTO ip_blocks (ip, failed_attempts) VALUES (?, 1)
          `, [ip]);
        }
      } catch (dbError) {
        console.warn("Database connection failed during failed attempt record.", dbError);
      }

      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Login Success
    try {
      if (blockRecord && blockRecord.failed_attempts > 0) {
        const db = getDb();
        await db.query('DELETE FROM ip_blocks WHERE ip = ?', [ip]);
      }
    } catch (dbError) {}

    // Create JWT Session Cookie
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key");
    const token = await new SignJWT({ user: "admin", ip })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secret);

    const response = NextResponse.json({ success: true });
    
    // Set cookie
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
