"use client";

import React from "react";
import { Play, Square, RotateCcw, AlertTriangle, User, RefreshCw, Archive, Box, ChevronRight, CheckCircle2, Info, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, AppNotification } from "@/hooks/useNotifications";

export function ActivityLogs() {
  const { notifications } = useNotifications();

  // Helper to format time (e.g. "2m ago")
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Helper to get icon and colors based on type/title
  const getActivityStyling = (notif: AppNotification) => {
    const title = notif.title.toLowerCase();
    
    if (title.includes("online") || title.includes("start") || title.includes("login")) {
      return { icon: Play, color: "text-green-400 bg-green-500/10 border-green-500/20" };
    }
    if (title.includes("offline") || title.includes("stop") || title.includes("kill")) {
      return { icon: Square, color: "text-red-400 bg-red-500/10 border-red-500/20" };
    }
    if (title.includes("restart")) {
      return { icon: RotateCcw, color: "text-orange-400 bg-orange-500/10 border-orange-500/20" };
    }
    if (title.includes("backup")) {
      return { icon: Archive, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
    }
    if (title.includes("password") || title.includes("reinstall")) {
      return { icon: AlertTriangle, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
    }

    // Fallbacks based on type
    if (notif.type === 'success') return { icon: CheckCircle2, color: "text-green-400 bg-green-500/10 border-green-500/20" };
    if (notif.type === 'warning') return { icon: AlertTriangle, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
    if (notif.type === 'error') return { icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20" };
    return { icon: Info, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="bg-[#0b0f19]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl sticky top-6 max-h-[800px] overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between mb-8 shrink-0">
        <h3 className="text-sm font-semibold text-white tracking-wide">Activity Feed</h3>
        <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center transition-colors">
          Live <span className="ml-1.5 relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-sm">
            No recent activity detected.
          </div>
        ) : (
          <div className="relative ml-6 pl-5 border-l-2 border-white/5 space-y-8 pt-2 pb-4">
            <AnimatePresence>
              {notifications.slice(0, 15).map((activity, idx) => {
                const { icon: Icon, color } = getActivityStyling(activity);
                return (
                  <motion.div 
                    key={activity.id} 
                    initial={{ opacity: 0, x: -10, height: 0 }} 
                    animate={{ opacity: 1, x: 0, height: "auto" }} 
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative group"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[37px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-[#0a0a0a] ${color} group-hover:scale-110 transition-transform duration-300 shadow-xl z-10`}>
                      <Icon size={14} />
                    </div>
                    
                    <div className="flex flex-col pt-1 pl-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium text-slate-200">{activity.title}</h4>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                      
                      <div className="text-xs text-slate-400 mt-2 flex flex-col xl:flex-row xl:items-center gap-2">
                        <span className="flex items-center gap-1.5 shrink-0 bg-white/5 px-2 py-1 rounded-md border border-white/5 w-fit">
                          <User size={12} className="text-slate-400" />
                          System / Admin
                        </span>
                        <span className="hidden xl:block text-slate-600 shrink-0">•</span>
                        <span className="text-slate-300 font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-md shadow-sm line-clamp-2 w-fit">{activity.message}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
