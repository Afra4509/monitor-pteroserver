"use client";

import React, { useEffect, useState } from "react";
import { Database, Eye, EyeOff, Copy, Loader2, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function DatabasesModule() {
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const res = await fetch("/api/pterodactyl/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: "/databases?include=password", method: "GET" })
        });
        const json = await res.json();
        
        if (json.data) {
          setDatabases(json.data);
        } else {
          toast.error("Failed to fetch databases");
        }
      } catch (err) {
        console.error(err);
        toast.error("Network error while fetching databases");
      } finally {
        setLoading(false);
      }
    };

    fetchDatabases();
  }, []);

  const togglePassword = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (databases.length === 0) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Database size={32} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-white">No Databases Found</h3>
        <p className="text-slate-400 mt-2">There are no databases assigned to this server.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <HardDrive className="text-indigo-500" />
          Databases
        </h2>
      </div>

      <div className="grid gap-6">
        {databases.map((db, idx) => {
          const attr = db.attributes;
          const endpoint = `${attr.host.address}:${attr.host.port}`;
          // Note: Pterodactyl API usually doesn't return the raw password in the list endpoint. 
          // If it doesn't, we will display a masked string and indicate it can't be fetched.
          const password = attr.relationships?.password?.attributes?.password || attr.password || "••••••••••••••••";
          
          const jdbc = `jdbc:mysql://${attr.username}:${encodeURIComponent(password)}@${endpoint}/${attr.name}`;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={attr.id} 
              className="bg-[#0b0f19]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Database className="text-indigo-400" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{attr.name}</h3>
                  <span className="text-xs text-slate-400">Database Connection Details</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Field label="ENDPOINT" value={endpoint} onCopy={() => copyToClipboard(endpoint, "Endpoint")} />
                <Field label="CONNECTIONS FROM" value={attr.connections_from} onCopy={() => copyToClipboard(attr.connections_from, "Connections from")} />
                <Field label="USERNAME" value={attr.username} onCopy={() => copyToClipboard(attr.username, "Username")} />
                
                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 tracking-wider">PASSWORD</label>
                  <div className="relative flex items-center">
                    <input 
                      type={showPassword[attr.id] ? "text" : "password"} 
                      value={password}
                      readOnly
                      className="w-full bg-white/5 border border-white/10 rounded-lg h-11 pl-4 pr-24 text-sm text-slate-200 font-mono focus:outline-none"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button 
                        onClick={() => togglePassword(attr.id)}
                        className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword[attr.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button 
                        onClick={() => copyToClipboard(password, "Password")}
                        className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <Field label="JDBC CONNECTION STRING" value={jdbc} onCopy={() => copyToClipboard(jdbc, "JDBC String")} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, value, onCopy }: { label: string, value: string, onCopy: () => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400 tracking-wider">{label}</label>
      <div className="relative group">
        <input 
          type="text" 
          value={value}
          readOnly
          className="w-full bg-white/5 border border-white/10 rounded-lg h-11 pl-4 pr-12 text-sm text-slate-200 font-mono focus:outline-none"
        />
        <button 
          onClick={onCopy}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all"
        >
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
}
