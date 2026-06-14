"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Activity, Cpu, HardDrive, MemoryStick, Network, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Progress } from "./ui/progress";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DataPoint = {
  time: string;
  cpu: number;
  ram: number;
  netIn: number;
  netOut: number;
};

export function StatsComponent() {
  const [stats, setStats] = useState({
    cpu: 0,
    ram: 0,
    disk: 0,
    netInBytes: 0,
    netOutBytes: 0,
    netInStr: "0 KB/s",
    netOutStr: "0 KB/s",
    uptime: "0s",
    state: "offline"
  });

  const [history, setHistory] = useState<DataPoint[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/pterodactyl/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: "/resources", method: "GET" })
        });
        const json = await res.json();
        
        if (json.attributes) {
          const r = json.attributes.resources;
          const formatBytes = (bytes: number) => {
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
            return (bytes / (1024 * 1024)).toFixed(1) + " MB";
          };
          const formatUptime = (ms: number) => {
            const days = Math.floor(ms / 86400000);
            const hours = Math.floor((ms % 86400000) / 3600000);
            const mins = Math.floor((ms % 3600000) / 60000);
            const secs = Math.floor((ms % 60000) / 1000);
            if (days > 0) return `${days}d ${hours}h`;
            if (hours > 0) return `${hours}h ${mins}m`;
            if (mins > 0) return `${mins}m ${secs}s`;
            return `${secs}s`;
          };

          const newCpu = Math.min(Number(r.cpu_absolute.toFixed(2)), 100);
          const newRam = Number((r.memory_bytes / (1024 * 1024)).toFixed(1));

          setStats({
            cpu: newCpu,
            ram: newRam,
            disk: Number((r.disk_bytes / (1024 * 1024)).toFixed(1)), 
            netInBytes: r.network_rx_bytes,
            netOutBytes: r.network_tx_bytes,
            netInStr: formatBytes(r.network_rx_bytes) + "/s",
            netOutStr: formatBytes(r.network_tx_bytes) + "/s",
            uptime: formatUptime(r.uptime),
            state: json.attributes.current_state
          });

          // Add to history
          setHistory(prev => {
            const now = new Date();
            const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            const newPoint = {
              time: timeStr,
              cpu: newCpu,
              ram: newRam,
              netIn: Number((r.network_rx_bytes / 1024).toFixed(1)), // KB for chart
              netOut: Number((r.network_tx_bytes / 1024).toFixed(1)) // KB for chart
            };
            const nextHistory = [...prev, newPoint];
            if (nextHistory.length > 20) return nextHistory.slice(1);
            return nextHistory;
          });
        }
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (state: string) => {
    switch(state) {
      case 'running': return 'text-green-500';
      case 'starting': return 'text-yellow-500';
      case 'stopping': return 'text-orange-500';
      default: return 'text-red-500';
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="flex flex-col gap-4">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="CPU Usage" icon={<Cpu size={16} className="text-blue-500" />} value={`${stats.cpu}%`} progress={stats.cpu} color="bg-blue-500" />
        <StatCard title="RAM Usage" icon={<MemoryStick size={16} className="text-green-500" />} value={`${stats.ram} MB`} progress={(stats.ram / 1024) * 100} color="bg-green-500" />
        <StatCard title="Disk Usage" icon={<HardDrive size={16} className="text-orange-500" />} value={`${stats.disk} MB`} progress={(stats.disk / 5120) * 100} color="bg-orange-500" />
        <StatCard title="Net In" icon={<ArrowDownToLine size={16} className="text-cyan-500" />} value={stats.netInStr} progress={0} hideProgress color="bg-cyan-500" />
        <StatCard title="Net Out" icon={<ArrowUpFromLine size={16} className="text-purple-500" />} value={stats.netOutStr} progress={0} hideProgress color="bg-purple-500" />
        <Card className="bg-card/50 backdrop-blur-sm border-border shadow-sm flex flex-col justify-center items-center text-center">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1 justify-center">
              <Activity size={14} className={getStatusColor(stats.state)} />
              {stats.state === 'offline' ? 'Offline' : capitalize(stats.state)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-2">
            <div className="text-sm font-bold">{stats.state !== 'offline' ? stats.uptime : '--'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Realtime Graph Area */}
      <Card className="bg-card/80 backdrop-blur-md border-border shadow-xl overflow-hidden relative">
        <CardHeader className="py-3 px-4 border-b bg-muted/30">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            Realtime Resource Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area type="monotone" dataKey="cpu" name="CPU (%)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
              <Area type="monotone" dataKey="ram" name="RAM (MB)" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, icon, value, progress, color, hideProgress }: { title: string, icon: React.ReactNode, value: string, progress: number, color: string, hideProgress?: boolean }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border shadow-sm overflow-hidden relative group">
      <div className={`absolute top-0 left-0 w-1 h-full ${color} opacity-50`} />
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-3">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="text-lg font-bold mb-1 truncate">{value}</div>
        {!hideProgress && (
          <Progress value={progress > 100 ? 100 : progress} className="h-1 bg-muted" indicatorClassName={color} />
        )}
      </CardContent>
    </Card>
  );
}
