"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface AnalyticsGridProps {
  history: any[];
}

export function AnalyticsGrid({ history }: AnalyticsGridProps) {
  if (!history || history.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2].map(i => (
          <div key={i} className="h-[250px] bg-[#0b0f19]/80 backdrop-blur-xl border border-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const formatNetSpeed = (kbps: number) => {
    if (kbps < 1024) return `${kbps.toFixed(1)} KB/s`;
    if (kbps < 1024 * 1024) return `${(kbps / 1024).toFixed(1)} MB/s`;
    return `${(kbps / (1024 * 1024)).toFixed(1)} GB/s`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl font-mono text-sm">
          <p className="text-slate-400 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-white font-medium">{entry.name}:</span>
              <span className="text-slate-200">
                {entry.name === "Download" || entry.name === "Upload" 
                  ? formatNetSpeed(entry.value)
                  : `${entry.value.toFixed(1)} ${entry.name === "CPU" || entry.name === "RAM" ? "%" : "MB"}`
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* System Resources */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-[#0b0f19]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl"
      >
        <h3 className="text-sm font-semibold text-slate-200 mb-6">System Resources</h3>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={11} tickMargin={10} minTickGap={30} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickFormatter={(val) => `${val}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cpu" name="CPU" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
              <Area type="monotone" dataKey="ram" name="RAM" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Network Traffic */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-[#0b0f19]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl"
      >
        <h3 className="text-sm font-semibold text-slate-200 mb-6">Network Traffic</h3>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNetIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNetOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={11} tickMargin={10} minTickGap={30} />
              <YAxis 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={11} 
                tickFormatter={(val) => {
                  if (val === 0) return "0";
                  if (val < 1024) return `${val} KB/s`;
                  return `${(val / 1024).toFixed(1)} MB/s`;
                }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="netIn" name="Download" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorNetIn)" isAnimationActive={false} />
              <Area type="monotone" dataKey="netOut" name="Upload" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorNetOut)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
}
