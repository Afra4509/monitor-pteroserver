import { NextRequest, NextResponse } from "next/server";
import WebSocket from "ws";

export async function GET(req: NextRequest) {
  const PANEL_URL = process.env.PTERODACTYL_PANEL_URL;
  const API_KEY = process.env.PTERODACTYL_API_KEY;
  const SERVER_ID = process.env.PTERODACTYL_SERVER_ID;

  if (!PANEL_URL || !API_KEY || !SERVER_ID) {
    return new NextResponse("Missing credentials", { status: 500 });
  }

  // 1. Fetch WebSocket credentials via HTTP
  const wsUrl = `${PANEL_URL}/api/client/servers/${SERVER_ID}/websocket`;
  let token = "";
  let socket = "";

  try {
    const res = await fetch(wsUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json"
      }
    });
    const json = await res.json();
    if (!json.data) throw new Error("No data in response");
    token = json.data.token;
    socket = json.data.socket;
  } catch {
    return new NextResponse("Failed to fetch WS credentials", { status: 500 });
  }

  // 2. Set up SSE Stream
  const stream = new ReadableStream({
    start(controller) {
      // Connect to Daemon WS
      const ws = new WebSocket(socket, {
        headers: {
          // Spoof Origin to bypass CORS on the daemon if needed
          Origin: PANEL_URL
        }
      });

      ws.on("open", () => {
        // Authenticate
        ws.send(JSON.stringify({ event: "auth", args: [token] }));
        
        // Notify client
        controller.enqueue(`data: ${JSON.stringify({ event: "proxy_connected" })}\n\n`);
      });

      ws.on("message", (data) => {
        // Forward message to client
        const msg = data.toString();
        // Send as Server-Sent Event
        controller.enqueue(`data: ${msg}\n\n`);
        
        // If auth success, request logs
        try {
          const parsed = JSON.parse(msg);
          if (parsed.event === "auth success") {
            ws.send(JSON.stringify({ event: "send logs", args: [null] }));
          }
        } catch {}
      });

      ws.on("close", () => {
        controller.enqueue(`data: ${JSON.stringify({ event: "proxy_disconnected" })}\n\n`);
        try { controller.close(); } catch {}
      });

      ws.on("error", (err) => {
        controller.enqueue(`data: ${JSON.stringify({ event: "proxy_error", args: [err.message] })}\n\n`);
        try { controller.close(); } catch {}
      });

      // Cleanup when client disconnects
      req.signal.addEventListener("abort", () => {
        ws.close();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
