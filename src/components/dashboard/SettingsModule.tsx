"use client";

import React, { useEffect, useState } from "react";
import { Settings, Server, Globe, KeyRound, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function SettingsModule() {
  const [serverDetails, setServerDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Reinstall state
  const [isReinstalling, setIsReinstalling] = useState(false);

  useEffect(() => {
    const fetchServerDetails = async () => {
      try {
        // Fetch server details from proxy
        const res = await fetch("/api/pterodactyl/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: "/", method: "GET" })
        });
        const json = await res.json();
        
        if (json.attributes) {
          setServerDetails(json.attributes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServerDetails();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setIsChangingPwd(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (res.ok) {
        toast.success("Password changed successfully!");
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app-notification', {
            detail: { title: "Password Changed", message: "Your dashboard access password has been successfully updated.", type: "warning" }
          }));
        }

        setCurrentPassword("");
        setNewPassword("");
      } else {
        const data = await res.json();
        toast.error("Failed to change password", { description: data.error });
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleReinstall = async () => {
    if (!confirm("WARNING: Are you sure you want to reinstall the server? Some files may be deleted or replaced!")) return;

    setIsReinstalling(true);
    try {
      const res = await fetch("/api/pterodactyl/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "/settings/reinstall", method: "POST" })
      });

      if (res.status === 204 || res.ok) {
        toast.success("Server reinstallation started!");
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app-notification', {
            detail: { title: "Reinstallation Started", message: "A server reinstall was initiated from the dashboard.", type: "error" }
          }));
        }
      } else {
        toast.error("Failed to initiate reinstall");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsReinstalling(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-indigo-500" />
          Settings
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Server Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#0b0f19]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Server className="text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Server Info</h3>
              <span className="text-xs text-slate-400">General server details</span>
            </div>
          </div>

          <div className="space-y-4">
            <InfoRow label="Server Name" value={serverDetails?.name || "Unknown"} />
            <InfoRow label="Node" value={serverDetails?.node || "Unknown"} />
            <InfoRow label="UUID" value={serverDetails?.uuid || "Unknown"} />
          </div>
        </motion.div>

        {/* SFTP Details */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-[#0b0f19]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <Globe className="text-cyan-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">SFTP Details</h3>
              <span className="text-xs text-slate-400">File transfer credentials</span>
            </div>
          </div>

          <div className="space-y-4">
            <InfoRow label="Server Address" value={`sftp://${serverDetails?.sftp_details?.ip}:${serverDetails?.sftp_details?.port}`} />
            <InfoRow label="Username" value={serverDetails?.sftp_details?.username || "Unknown"} />
            <div className="mt-4 p-3 rounded-xl bg-white/5 text-xs text-slate-400 border border-white/10">
              Use these details with an SFTP client like FileZilla or WinSCP to manage your server files directly. The password is your panel password.
            </div>
          </div>
        </motion.div>

        {/* Dashboard Security */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-[#0b0f19]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <KeyRound className="text-purple-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dashboard Security</h3>
              <span className="text-xs text-slate-400">Change your web access password</span>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 tracking-wider mb-1 block">CURRENT PASSWORD</label>
              <input 
                type="password" 
                value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 tracking-wider mb-1 block">NEW PASSWORD</label>
              <input 
                type="password" 
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                required minLength={6}
              />
            </div>
            <button 
              type="submit" disabled={isChangingPwd || !currentPassword || !newPassword}
              className="w-full h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isChangingPwd ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
            </button>
          </form>
        </motion.div>

        {/* Danger Zone */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-500/20">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <AlertTriangle className="text-red-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Danger Zone</h3>
              <span className="text-xs text-red-400/80">Irreversible actions</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Reinstall Server</h4>
                <p className="text-xs text-red-200/70 mt-1 max-w-xs">
                  Reinstalling your server will stop it, and then re-run the installation script. This may overwrite essential files!
                </p>
              </div>
              <button 
                onClick={handleReinstall} disabled={isReinstalling}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-500/20 whitespace-nowrap transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isReinstalling && <Loader2 size={16} className="animate-spin" />}
                Reinstall
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-slate-200 bg-white/5 px-3 py-2 rounded-lg border border-white/5 font-mono break-all">
        {value}
      </span>
    </div>
  );
}
