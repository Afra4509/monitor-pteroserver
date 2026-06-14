import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { headers } from "next/headers";
import { getDb, initDb } from "@/lib/db";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "afraserver | Control Panel",
  description: "Premium Server Management Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let isBlocked = false;
  let blockMessage = "";

  try {
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1';
    
    await initDb();
    const db = getDb();
    const [rows] = await db.query('SELECT * FROM ip_blocks WHERE ip = ?', [ip]);
    const record = (rows as { is_banned: boolean, block_expires: string | Date }[])[0];

    if (record) {
      if (record.is_banned) {
        isBlocked = true;
        blockMessage = "Your IP address has been permanently banned from accessing this server due to malicious activity.";
      } else if (record.block_expires && new Date(record.block_expires) > new Date()) {
        isBlocked = true;
        blockMessage = "You have been temporarily timed out due to multiple failed login attempts. Please try again in 24 hours.";
      }
    }
  } catch {
    // Gunakan console.warn agar tidak memunculkan popup error merah muda di layar Next.js
    console.warn("[Shield] Database is offline, IP protection skipped.");
  }

  if (isBlocked) {
    return (
      <html lang="en">
        <head>
          <title>Access Denied</title>
        </head>
        <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans bg-black text-white flex items-center justify-center h-screen`}>
          <div className="text-center p-8 border border-red-500/20 bg-red-500/5 rounded-2xl max-w-lg mx-4 backdrop-blur-md">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🛡️</span>
            </div>
            <h1 className="text-2xl font-bold text-red-500 mb-4 tracking-tight">ACCESS DENIED</h1>
            <p className="text-slate-400 font-medium leading-relaxed">{blockMessage}</p>
            <div className="mt-8 pt-6 border-t border-red-500/10 text-xs text-slate-600 font-mono">
              Protected by afraserver Shield
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#000000] text-slate-200`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
