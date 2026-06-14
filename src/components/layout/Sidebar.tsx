"use client";

import React, { useState } from "react";
import { LayoutDashboard, Terminal, HardDrive, Settings, Users, Shield, Menu, Network, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { icon: LayoutDashboard, label: "Overview" },
    { icon: Terminal, label: "Console" },
    { icon: Network, label: "Network" },
    { icon: HardDrive, label: "Databases" },
    { icon: Shield, label: "Security" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <motion.aside 
      suppressHydrationWarning
      animate={{ width: collapsed ? 80 : 260 }}
      className="hidden lg:flex flex-col border-r border-white/5 bg-[#0a0a0a]/50 backdrop-blur-2xl z-50 h-screen sticky top-0 transition-all duration-300 ease-in-out shrink-0"
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-2 cursor-pointer">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-md shadow-lg shadow-indigo-500/20" />
            <span className="font-bold tracking-tight text-white">afraserver</span>
          </motion.div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer ${collapsed ? "mx-auto" : ""}`}
        >
          <Menu size={18} />
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto no-scrollbar">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = activeView === link.label;
          return (
            <button
              key={link.label}
              onClick={() => setActiveView(link.label)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
                isActive 
                  ? "bg-indigo-500/10 text-indigo-400 font-medium" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div layoutId="active-nav" className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" />
              )}
              <Icon size={18} className={`shrink-0 ${isActive ? "text-indigo-400" : "group-hover:text-white transition-colors"}`} />
              {!collapsed && (
                <span className="truncate">{link.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-1">
        <button 
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 rounded-xl transition-colors border border-transparent"
        >
          <LogOut size={16} />
          {!collapsed && "Logout"}
        </button>
        <button 
          onClick={() => toast.success("Billing Panel", { description: "Opening billing portal..." })}
          className={`w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 shrink-0 shadow-lg shadow-red-500/20" />
          {!collapsed && (
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-white leading-none">Admin</span>
              <span className="text-xs text-slate-400 mt-1">Premium Tier</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
