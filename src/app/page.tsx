"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Header } from "@/components/layout/Header";
import { TerminalComponent } from "@/components/TerminalComponent";
import { ServerControls } from "@/components/dashboard/ServerControls";
import { AnalyticsGrid } from "@/components/dashboard/AnalyticsGrid";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { ActivityLogs } from "@/components/dashboard/ActivityLogs";
import { DatabasesModule } from "@/components/dashboard/DatabasesModule";
import { SettingsModule } from "@/components/dashboard/SettingsModule";
import { SecurityModule } from "@/components/dashboard/SecurityModule";
import { useServerStats } from "@/hooks/useServerStats";
import { Toaster } from "sonner";

export default function Home() {
  const { stats, history } = useServerStats();
  const [activeView, setActiveView] = useState("Overview");

  // Track Visit and Leave
  React.useEffect(() => {
    fetch('/api/security/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enter', path: '/' })
    }).catch(console.error);

    const handleBeforeUnload = () => {
      navigator.sendBeacon('/api/security/track', JSON.stringify({ action: 'leave', path: '/' }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#000000] text-slate-300 flex font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

        <Header serverState={stats?.state || "offline"} setActiveView={setActiveView} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar relative z-10 pb-24 lg:pb-8">
          <div className="max-w-[1800px] mx-auto">
            
            {activeView === "Overview" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <QuickStats 
                  cpu={stats?.cpu || 0} ram={stats?.ram || 0} disk={stats?.disk || 0} 
                  netInStr={stats?.netInStr || "0 B/s"} netOutStr={stats?.netOutStr || "0 B/s"} 
                  uptime={stats?.uptime || "0s"} state={stats?.state || "offline"} 
                />
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  <div className="xl:col-span-8 flex flex-col gap-6">
                    <ServerControls />
                    <AnalyticsGrid history={history || []} />
                  </div>
                  <div className="xl:col-span-4 flex flex-col gap-6">
                    <ActivityLogs />
                  </div>
                </div>
              </div>
            )}

            {activeView === "Console" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col gap-4">
                <div className="h-[55vh] md:h-[60vh] lg:h-[650px] w-full min-h-[400px]">
                  <TerminalComponent />
                </div>
                <ServerControls />
              </div>
            )}

            {activeView === "Network" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AnalyticsGrid history={history || []} />
              </div>
            )}

            {activeView === "Databases" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DatabasesModule />
              </div>
            )}

            {activeView === "Settings" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SettingsModule />
              </div>
            )}

            {activeView === "Security" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SecurityModule />
              </div>
            )}

          </div>
        </main>
      </div>

      <MobileNav activeView={activeView} setActiveView={setActiveView} />

      <Toaster theme="dark" position="bottom-right" toastOptions={{
        className: 'bg-[#0a0a0a] border border-white/10 text-white backdrop-blur-xl',
        descriptionClassName: 'text-slate-400'
      }} />
    </div>
  );
}
