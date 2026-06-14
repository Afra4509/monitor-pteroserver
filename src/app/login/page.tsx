"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Hexagon, ArrowRight, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/security/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enter', path: '/login' })
    }).catch(console.error);

    const handleBeforeUnload = () => {
      navigator.sendBeacon('/api/security/track', JSON.stringify({ action: 'leave', path: '/login' }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        toast.success("Access Granted", { description: "Welcome to the dashboard." });
        
        // Dispatch global notification
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app-notification', {
            detail: { title: "New Login Detected", message: "A new secure session was established.", type: "success" }
          }));
        }

        // Small delay for the success toast to be seen before redirecting
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 800);
      } else {
        const data = await res.json();
        toast.error("Access Denied", { description: data.error || "Incorrect password" });
        setPassword("");
      }
    } catch (err) {
      toast.error("Network Error", { description: "Could not connect to authentication server." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#000000] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0b0f19]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-6"
            >
              <Hexagon size={32} className="text-white fill-white/20" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">afraserver</h1>
            <p className="text-sm text-slate-400 font-medium text-center">Premium Server Management</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Access Key..."
                className="w-full bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-500 rounded-xl h-14 pl-12 pr-4 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono tracking-widest shadow-inner"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 disabled:hover:from-indigo-500 disabled:hover:to-purple-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Authenticate</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs font-medium text-slate-500 mt-8">
          Protected by Pterodactyl Database Node
        </p>
      </motion.div>

      <Toaster theme="dark" position="bottom-center" toastOptions={{
        className: 'bg-[#0a0a0a] border border-white/10 text-white backdrop-blur-xl',
        descriptionClassName: 'text-slate-400'
      }} />
    </div>
  );
}
