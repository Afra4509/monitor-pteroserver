"use client";

import React, { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, Maximize2, Minimize2, Search, Copy, Download, Trash2, Pause, Play, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function TerminalComponent() {
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const xtermInstance = useRef<any>(null);

  useEffect(() => {
    let fitAddon: any = null;
    let resizeObserver: ResizeObserver | null = null;
    let isDisposed = false;
    let eventSource: EventSource | null = null;

    const initTerminal = async () => {
      if (!terminalRef.current || isDisposed) return;

      // Async imports take time. React StrictMode unmounts and remounts instantly.
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");
      // @ts-ignore: TypeScript cannot resolve CSS module types natively here
      await import("@xterm/xterm/css/xterm.css");

      // CRITICAL FIX: If the component was unmounted while we were waiting for the imports,
      // ABORT immediately! Otherwise, we will mount a duplicate "ghost" terminal which
      // pushes the real terminal out of the screen, creating the huge black gap!
      if (isDisposed || !terminalRef.current) return;

      // Purge any existing phantom terminals just to be absolutely certain
      terminalRef.current.innerHTML = "";

      const term = new Terminal({
        theme: {
          background: "#0a0a0a",
          foreground: "#e2e8f0",
          cursor: "#8b5cf6",
          cursorAccent: "#000000",
          selectionBackground: "rgba(139, 92, 246, 0.3)",
          black: "#000000",
          red: "#ef4444",
          green: "#22c55e",
          yellow: "#eab308",
          blue: "#3b82f6",
          magenta: "#d946ef",
          cyan: "#06b6d4",
          white: "#ffffff",
        },
        fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: 13,
        lineHeight: 1.4,
        cursorBlink: true,
        disableStdin: true,
        scrollback: 5000,
        convertEol: true, 
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      xtermInstance.current = term;

      const doFit = () => {
        try { if (fitAddon) fitAddon.fit(); } catch(e) {}
      };

      doFit();

      resizeObserver = new ResizeObserver(() => {
        if (!isDisposed) window.requestAnimationFrame(doFit);
      });
      
      if (terminalContainerRef.current) {
        resizeObserver.observe(terminalContainerRef.current);
      }

      term.writeln("\x1b[1;36m[System]\x1b[0m Initializing secure terminal connection...");

      setTimeout(() => {
        if (isDisposed) return;
        doFit();
        
        eventSource = new EventSource("/api/pterodactyl/console");
        
        eventSource.onopen = () => {
          if (isDisposed) return;
          setIsConnected(true);
          term.writeln("\x1b[1;32m[System]\x1b[0m Connected to daemon. Waiting for logs...");
        };

        eventSource.onmessage = (event) => {
          if (isDisposed || isPaused) return;
          try {
            const data = JSON.parse(event.data);
            if (data.event === "console output") {
              term.writeln(data.args[0]);
            } else if (data.event === "proxy_connected") {
              setIsConnected(true);
              term.writeln("\x1b[1;32m[System]\x1b[0m Connected to daemon. Waiting for logs...");
            } else if (data.event === "proxy_error") {
              term.writeln(`\x1b[1;31m[System]\x1b[0m Error: ${data.args[0]}`);
            }
          } catch (e) {
            term.writeln(event.data);
          }
        };

        eventSource.onerror = () => {
          if (isDisposed) return;
          setIsConnected(false);
          term.writeln("\x1b[1;31m[System]\x1b[0m Connection lost. Attempting to reconnect...");
        };
      }, 50);
    };

    const cleanup = initTerminal();

    const handleExportLogs = () => {
      const term = xtermInstance.current;
      if (!term) {
        return;
      }
      
      let content = "";
      for (let i = 0; i < term.buffer.active.length; i++) {
        const line = term.buffer.active.getLine(i);
        if (line) {
          content += line.translateToString(true) + "\\n";
        }
      }
      
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `server-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    window.addEventListener("export-terminal-logs", handleExportLogs);

    return () => {
      isDisposed = true;
      if (resizeObserver) resizeObserver.disconnect();
      if (eventSource) eventSource.close();
      window.removeEventListener("export-terminal-logs", handleExportLogs);
      cleanup.then(clean => clean?.());
      if (xtermInstance.current) {
        xtermInstance.current.dispose();
      }
    };
  }, [isPaused]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#0b0f19]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col ${isFullscreen ? "fixed inset-4 z-50" : "h-full w-full"}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <TerminalIcon size={16} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide">Live Console</h2>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${isConnected ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
            {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <ToolbarButton icon={<Search size={14} />} tooltip="Search Logs" onClick={() => toast.info("Tip: Use Ctrl+F or Cmd+F to search the logs")} />
          <ToolbarButton icon={<Copy size={14} />} tooltip="Copy All" onClick={() => {
            if (xtermInstance.current) {
              let content = "";
              for (let i = 0; i < xtermInstance.current.buffer.active.length; i++) {
                const line = xtermInstance.current.buffer.active.getLine(i);
                if (line) content += line.translateToString(true) + "\n";
              }
              navigator.clipboard.writeText(content);
              toast.success("Logs copied to clipboard!");
            }
          }} />
          <ToolbarButton icon={<Download size={14} />} tooltip="Download Logs" onClick={() => window.dispatchEvent(new Event('export-terminal-logs'))} />
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <ToolbarButton 
            icon={isPaused ? <Play size={14} className="text-yellow-400" /> : <Pause size={14} />} 
            tooltip={isPaused ? "Resume Scrolling" : "Pause Scrolling"} 
            onClick={() => setIsPaused(!isPaused)}
            active={isPaused}
          />
          <ToolbarButton 
            icon={<Trash2 size={14} />} 
            tooltip="Clear Terminal" 
            onClick={() => xtermInstance.current?.clear()}
          />
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <ToolbarButton 
            icon={isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />} 
            tooltip="Toggle Fullscreen" 
            onClick={() => setIsFullscreen(!isFullscreen)} 
          />
        </div>
      </div>

      <div ref={terminalContainerRef} className="flex-1 w-full relative bg-[#0a0a0a]">
        <div ref={terminalRef} className="absolute inset-2 overflow-hidden" />
        
        {isPaused && (
          <div className="absolute bottom-4 right-6 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md flex items-center gap-2 shadow-lg animate-pulse z-10">
            <Pause size={12} fill="currentColor" />
            Scrolling Paused
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ToolbarButton({ icon, tooltip, onClick, active }: { icon: React.ReactNode, tooltip: string, onClick?: () => void, active?: boolean }) {
  return (
    <button 
      onClick={onClick}
      title={tooltip}
      className={`p-1.5 rounded-md transition-colors ${active ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
    >
      {icon}
    </button>
  );
}
