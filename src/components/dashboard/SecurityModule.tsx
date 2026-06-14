"use client";

import React, { useEffect, useState } from "react";
import { Shield, ShieldAlert, CheckCircle2, XCircle, Clock, Trash2, Search, Activity, UserX, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function SecurityModule() {
  const [logs, setLogs] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [logsRes, blocksRes] = await Promise.all([
        fetch('/api/security/logs'),
        fetch('/api/security/blocked')
      ]);
      const logsData = await logsRes.json();
      const blocksData = await blocksRes.json();

      if (logsData.logs) setLogs(logsData.logs);
      if (logsData.totalUniqueVisitors) setTotalVisitors(logsData.totalUniqueVisitors);
      if (blocksData.blocks) setBlocks(blocksData.blocks);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load security data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleUnban = async (ip: string) => {
    try {
      const res = await fetch('/api/security/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });
      if (res.ok) {
        toast.success(`IP ${ip} has been unbanned!`);
        fetchData();
      } else {
        toast.error("Failed to unban IP");
      }
    } catch (e) {
      toast.error("Error unbanning IP");
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-indigo-500" /> Security & Audit Logs
          </h2>
          <p className="text-slate-400 mt-1">Monitor web traffic, login attempts, and active blocklists.</p>
        </div>
        <div className="flex items-center gap-4 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
          <Activity className="text-indigo-400" size={20} />
          <div>
            <p className="text-xs text-indigo-300 font-medium uppercase tracking-wider">Total Unique Visitors</p>
            <p className="text-xl font-bold text-white">{totalVisitors}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Blocklist Panel */}
        <div className="bg-[#0b0f19]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <ShieldAlert size={16} className="text-red-500" /> IP Blocklist
            </h3>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-md">{blocks.length} Blocked</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <CheckCircle2 size={40} className="text-green-500/50 mb-2" />
                <p>No blocked IPs. Your server is safe!</p>
              </div>
            ) : (
              blocks.map((block) => {
                const isBanned = block.is_banned;
                const expires = new Date(block.block_expires);
                const isActiveTimeout = !isBanned && expires > new Date();

                if (!isBanned && !isActiveTimeout) return null; // Ignore expired timeouts

                return (
                  <div key={block.ip} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-mono font-bold">{block.ip}</span>
                        {isBanned ? (
                          <span className="text-[10px] uppercase font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <XCircle size={10} /> BANNED
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock size={10} /> TIMEOUT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">Failed Attempts: <span className="text-slate-200 font-bold">{block.failed_attempts}</span></p>
                      {!isBanned && (
                        <p className="text-xs text-slate-500 mt-0.5">Expires: {expires.toLocaleString()}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleUnban(block.ip)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-green-500/20 text-slate-300 hover:text-green-400 rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      <UserCheck size={14} /> Unban
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Visitor Logs Panel */}
        <div className="bg-[#0b0f19]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> Visitor Traffic
            </h3>
            <span className="text-xs bg-white/10 text-slate-300 px-2 py-1 rounded-md">Live Stream</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {logs.length === 0 ? (
              <div className="text-center text-slate-500 py-10">No traffic logs yet.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${log.action === 'enter' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                      <span className="text-sm text-slate-200 font-mono">{log.ip}</span>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex flex-col gap-1 pl-4 border-l border-white/10 ml-1">
                    <span className="text-xs font-medium uppercase text-slate-400">
                      Action: <span className={log.action === 'enter' ? 'text-green-400' : 'text-red-400'}>{log.action}</span>
                    </span>
                    <span className="text-xs text-slate-500 truncate" title={log.user_agent}>
                      {log.user_agent}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono mt-1 bg-indigo-500/10 px-2 py-0.5 rounded w-fit">
                      {log.path || '/'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
