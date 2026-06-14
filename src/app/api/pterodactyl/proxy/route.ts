import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint, method = "GET", data } = body;

    const PANEL_URL = process.env.PTERODACTYL_PANEL_URL;
    const API_KEY = process.env.PTERODACTYL_API_KEY;
    const SERVER_ID = process.env.PTERODACTYL_SERVER_ID;

    if (!PANEL_URL || !API_KEY || !SERVER_ID) {
      return NextResponse.json({ 
        errors: [{ detail: "Missing Pterodactyl credentials in .env.local" }]
      }, { status: 500 });
    }

    const url = `${PANEL_URL}/api/client/servers/${SERVER_ID}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      cache: "no-store"
    };

    if (data && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    // For 204 No Content, we can't parse JSON
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const resultText = await response.text();
    let result = {};
    
    if (resultText) {
      try {
        result = JSON.parse(resultText);
      } catch {
        console.error("[Pterodactyl Proxy] Failed to parse JSON:", resultText);
        // If it's not JSON but it failed, we create an error object
        if (!response.ok) {
          result = { errors: [{ detail: resultText || response.statusText }] };
        }
      }
    }

    // Forward the exact HTTP status from Pterodactyl
    return NextResponse.json(result, { status: response.status });
    
  } catch (error: unknown) {
    console.error("[Pterodactyl Proxy] Internal Server Error:", error);
    return NextResponse.json({ 
      errors: [{ detail: (error as Error).message || "Internal Server Error" }] 
    }, { status: 500 });
  }
}
