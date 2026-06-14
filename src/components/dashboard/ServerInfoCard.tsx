"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, HardDrive, MapPin, Network, Server, Fingerprint, Activity } from "lucide-react";

export function ServerInfoCard({ uptime, state }: { uptime: string, state: string }) {
  const infoItems = [
    { label: "Status", value: state === 'offline' ? 'Offline' : state === 'running' ? 'Online' : state, icon: Activity, color: state === 'running' ? "text-green-400" : state === 'starting' ? "text-yellow-400" : "text-red-400" },
    { label: "Uptime", value: uptime, icon: Clock, color: "text-slate-400" },
    { label: "Node", value: "ptero-node-01", icon: Server, color: "text-slate-400" },
    { label: "IP Address", value: "103.123.45.67:25565", icon: Network, color: "text-slate-400" },
    { label: "Server ID", value: "1a2b3c4d", icon: Fingerprint, color: "text-slate-400" },
    { label: "Location", value: "Singapore", icon: MapPin, color: "text-slate-400" },
  ];

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/5 shadow-xl flex flex-col h-full rounded-2xl overflow-hidden">
      <CardHeader className="py-4 px-5 border-b border-white/5 bg-white/[0.02]">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-200">
          <Activity size={16} className="text-indigo-400" />
          Server Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {infoItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Icon size={14} />
                  <span className="text-xs">{item.label}</span>
                </div>
                <div className={`text-xs font-medium ${item.label === 'Status' ? item.color + ' capitalize flex items-center gap-1.5' : 'text-slate-200'}`}>
                  {item.label === 'Status' && (
                    <span className={`w-1.5 h-1.5 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                  )}
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-500 text-center">
          Created at 14 Jun 2026, 10:21 PM
        </div>
      </CardContent>
    </Card>
  );
}
