"use client";

import React, { useState } from "react";
import { Play, Square, RotateCcw, Zap, RefreshCw, Download, ArrowRight, DatabaseBackup } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function ServerControls() {
  const [command, setCommand] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ action: string, label: string } | null>(null);

  const handleAction = async (action: string) => {
    setLoadingAction(action);
    setConfirmDialog(null);
    const signal = action.toLowerCase();
    
    try {
      const res = await fetch("/api/pterodactyl/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "/power", method: "POST", data: { signal } })
      });
      
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(`Signal sent`, { description: `Server is now ${action}ing.` });
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app-notification', {
            detail: { title: "Power Action Sent", message: `A ${action} signal was successfully sent to the server.`, type: action === 'kill' ? 'error' : 'info' }
          }));
        }
      } else {
        const errorMsg = json.errors?.[0]?.detail || res.statusText || "Unknown Backend Error";
        toast.error(`Action Failed (${res.status})`, { description: errorMsg });
      }
    } catch (e) {
      toast.error(`Network Error`, { description: "Could not reach the proxy server." });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBackup = async () => {
    const promise = fetch("/api/pterodactyl/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: "/backups", method: "POST", data: { name: "Dashboard Backup", is_locked: false } })
    }).then(async (res) => {
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.errors?.[0]?.detail || res.statusText || "Backup Failed");
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app-notification', {
          detail: { title: "Backup Started", message: "A server backup was successfully requested.", type: "info" }
        }));
      }

      return json;
    });

    toast.promise(promise, {
      loading: "Creating server backup in background...",
      success: "Backup request sent successfully! It will appear in your Pterodactyl backups.",
      error: (err) => `Failed to create backup: ${err.message}`
    });
  };

  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    
    setIsSending(true);
    try {
      const res = await fetch("/api/pterodactyl/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "/command", method: "POST", data: { command } })
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        setCommand("");
      } else {
        const errorMsg = json.errors?.[0]?.detail || res.statusText || "Unknown Backend Error";
        toast.error(`Command Failed (${res.status})`, { description: errorMsg });
      }
    } catch (e) {
      toast.error(`Network Error`, { description: "Could not reach the proxy server." });
    } finally {
      setIsSending(false);
    }
  };

  const requestAction = (action: string, label: string) => {
    if (action === "kill" || action === "stop") {
      setConfirmDialog({ action, label });
    } else {
      handleAction(action);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Console Input Bar */}
      <form onSubmit={handleSendCommand} className="relative flex items-center group">
        <div className="absolute left-4 text-slate-500 font-mono text-sm pointer-events-none transition-colors group-focus-within:text-indigo-400">{">_"}</div>
        <input 
          type="text" 
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Send a command to the daemon..." 
          className="w-full bg-[#0b0f19]/80 backdrop-blur-md border border-white/10 text-slate-200 placeholder:text-slate-500 rounded-xl h-14 pl-12 pr-32 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono text-sm shadow-xl shadow-black/20"
        />
        <button 
          disabled={isSending || !command.trim()}
          type="submit" 
          className="absolute right-1.5 top-1.5 bottom-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg"
        >
          <span>Send</span>
          {isSending ? <RefreshCw size={14} className="animate-spin" /> : <ArrowRight size={14} />}
        </button>
      </form>

      {/* Modern Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <ControlButton 
          icon={<Play size={16} />} label="Start" color="bg-white/5 border-white/10 hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-400" 
          onClick={() => requestAction("start", "Start")} isLoading={loadingAction === "start"} 
        />
        <ControlButton 
          icon={<RotateCcw size={16} />} label="Restart" color="bg-white/5 border-white/10 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400" 
          onClick={() => requestAction("restart", "Restart")} isLoading={loadingAction === "restart"} 
        />
        <ControlButton 
          icon={<Square size={14} fill="currentColor" />} label="Stop" color="bg-white/5 border-white/10 hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-400" 
          onClick={() => requestAction("stop", "Stop")} isLoading={loadingAction === "stop"} 
        />
        <ControlButton 
          icon={<Zap size={16} />} label="Kill" color="bg-white/5 border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400" 
          onClick={() => requestAction("kill", "Kill")} isLoading={loadingAction === "kill"} 
        />
        <ControlButton 
          icon={<DatabaseBackup size={16} />} label="Backup" color="bg-white/5 border-white/10 hover:bg-teal-500/20 hover:border-teal-500/50 hover:text-teal-400" 
          onClick={handleBackup} isLoading={false} 
        />
        <ControlButton 
          icon={<Download size={16} />} label="Export Logs" color="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20" 
          onClick={() => {
            const hasTerminal = document.querySelector('.xterm');
            if (!hasTerminal) {
              toast.error("Live Console is inactive", { description: "Please open the Console tab first to capture and export logs." });
              return;
            }
            window.dispatchEvent(new Event('export-terminal-logs'));
          }} isLoading={false} 
        />
        <ControlButton 
          icon={<RefreshCw size={16} />} label="Refresh" color="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20" 
          onClick={() => window.location.reload()} isLoading={false} 
        />
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDialog && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0b0f19] border border-white/10 rounded-2xl p-6 shadow-2xl max-w-sm w-full"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Confirm {confirmDialog.label}</h3>
              <p className="text-sm text-slate-400 mb-6">Are you sure you want to {confirmDialog.action} the server? This action might cause data loss if the server is actively saving.</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleAction(confirmDialog.action)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-lg shadow-red-500/20"
                >
                  Yes, {confirmDialog.label}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ControlButton({ icon, label, color, onClick, isLoading }: { icon: React.ReactNode, label: string, color: string, onClick: () => void, isLoading: boolean }) {
  return (
    <motion.button 
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={isLoading}
      className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-medium text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${color} text-slate-300`}
    >
      {isLoading ? <RefreshCw size={16} className="animate-spin text-slate-400" /> : icon}
      {label}
    </motion.button>
  );
}
