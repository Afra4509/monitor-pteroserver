"use client";

import React from "react";
import { Cpu, HardDrive, MemoryStick, Activity, ArrowDownToLine, ArrowUpFromLine, Clock, Server } from "lucide-react";
import { motion } from "framer-motion";

interface QuickStatsProps {
  cpu: number;
  ram: number;
  disk: number;
  netInStr: string;
  netOutStr: string;
  uptime: string;
  state: string;
}

export function QuickStats({ cpu, ram, disk, netInStr, netOutStr, uptime, state }: QuickStatsProps) {
  const stateColors = {
    running: { text: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    starting: { text: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    stopping: { text: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    offline: { text: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  };
  const sColors = stateColors[state as keyof typeof stateColors] || stateColors.offline;

  const cards = [
    { title: "CPU Usage", value: `${cpu.toFixed(1)}%`, icon: Cpu, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { title: "Memory", value: `${ram.toFixed(1)} MB`, icon: MemoryStick, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { title: "Disk Space", value: `${disk.toFixed(1)} MB`, icon: HardDrive, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { title: "Status", value: state.charAt(0).toUpperCase() + state.slice(1), icon: Server, color: sColors.text, bg: sColors.bg },
    { title: "Network In", value: netInStr, icon: ArrowDownToLine, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
    { title: "Network Out", value: netOutStr, icon: ArrowUpFromLine, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
    { title: "Uptime", value: uptime, icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { title: "Ping", value: state === "running" ? "12ms" : "N/A", icon: Activity, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-[#0b0f19]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-xl"
          >
            {/* Soft gradient orb in background */}
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-[20px] opacity-20 ${card.bg.split(' ')[0]}`} />
            
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${card.bg} ${card.color} shadow-inner`}>
                <Icon size={16} />
              </div>
              <span className="text-xs font-medium text-slate-400">{card.title}</span>
            </div>
            
            <div className="mt-auto">
              <span className="text-lg font-bold text-white tracking-tight">{card.value}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
