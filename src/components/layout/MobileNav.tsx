"use client";

import React from "react";
import { LayoutDashboard, Terminal, HardDrive, Settings, Network, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function MobileNav({ activeView, setActiveView }: MobileNavProps) {
  const links = [
    { icon: LayoutDashboard, label: "Overview" },
    { icon: Terminal, label: "Console" },
    { icon: Network, label: "Network" },
    { icon: HardDrive, label: "Databases" },
    { icon: Shield, label: "Security" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm h-16 bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] z-50 flex items-center justify-between px-2 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = activeView === link.label;
        
        return (
          <button
            key={link.label}
            onClick={() => setActiveView(link.label)}
            className={`relative flex items-center justify-center h-12 rounded-full transition-all duration-300 ease-out outline-none ${
              isActive ? "px-4" : "w-12 text-slate-500 hover:text-slate-300 hover:bg-white/5"
            }`}
          >
            {isActive && (
              <motion.div 
                layoutId="mobile-nav-pill" 
                className="absolute inset-0 bg-indigo-500/15 rounded-full border border-indigo-500/20" 
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
            
            <div className="relative flex items-center gap-2 z-10">
              <Icon 
                size={isActive ? 18 : 20} 
                className={`shrink-0 transition-colors duration-300 ${isActive ? "text-indigo-400" : ""}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              
              <AnimatePresence mode="popLayout">
                {isActive && (
                  <motion.span 
                    initial={{ width: 0, opacity: 0, x: -5 }}
                    animate={{ width: "auto", opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-bold text-indigo-400 overflow-hidden whitespace-nowrap"
                  >
                    {link.label === "Databases" ? "DB" : link.label === "Security" ? "Sec" : link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </button>
        );
      })}
    </div>
  );
}
