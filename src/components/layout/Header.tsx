"use client";

import React, { useState } from "react";
import { Search, Bell, Moon, Sun, Settings, Hexagon } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

export function Header({ serverState, setActiveView }: { serverState: string, setActiveView?: (view: string) => void }) {
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-2xl flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Hexagon size={18} className="text-white fill-white/20" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white hidden sm:block">
            afraserver
          </span>
        </div>
        
        <div className="w-[1px] h-6 bg-white/10 mx-2 hidden sm:block" />

        {/* State Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
          <div className={`w-2 h-2 rounded-full ${
            serverState === "running" ? "bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" : 
            serverState === "starting" ? "bg-yellow-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]" :
            serverState === "stopping" ? "bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]" :
            "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
          }`} />
          <span className="text-xs font-medium text-slate-300 capitalize">{serverState}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search resources... (Ctrl+K)" 
            className="w-64 bg-white/5 border border-white/10 rounded-full h-9 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                toast.info("Search initiated", { description: `Searching for: ${e.currentTarget.value}` });
                e.currentTarget.value = "";
              }
            }}
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors relative"
          >
            <Bell size={18} />
            {/* Notification Dot */}
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-12 right-0 w-80 bg-[#0b0f19] border border-white/10 rounded-2xl shadow-2xl p-4 overflow-hidden z-50 flex flex-col max-h-[400px]"
              >
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <h4 className="text-sm font-semibold text-white">Notifications</h4>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button onClick={clearAll} className="text-[10px] text-slate-500 hover:text-red-400 font-medium transition-colors">
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-sm">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className={`flex flex-col gap-1 p-2.5 rounded-xl border ${notif.read ? 'bg-transparent border-transparent' : 'bg-white/5 border-white/10'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${
                            notif.type === 'success' ? 'text-green-400' :
                            notif.type === 'error' ? 'text-red-400' :
                            notif.type === 'warning' ? 'text-yellow-400' : 'text-slate-200'
                          }`}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 leading-relaxed">{notif.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button 
            onClick={() => setActiveView && setActiveView("Settings")}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="w-[1px] h-6 bg-white/10 mx-1" />

        {/* Profile */}
        <div 
          onClick={() => toast.success("Profile clicked", { description: "Logged in as Admin" })}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border-2 border-[#0a0a0a] ring-2 ring-white/10 cursor-pointer overflow-hidden shadow-lg hover:ring-indigo-500 transition-all" 
        />
      </div>
    </header>
  );
}
