"use client";

import { useState, useEffect, useRef } from "react";
import { dispatchNotification } from "./useNotifications";

export type DataPoint = {
  time: string;
  cpu: number;
  ram: number;
  disk: number;
  netIn: number;
  netOut: number;
};

export type ServerStats = {
  cpu: number;
  ram: number;
  disk: number;
  netInBytes: number;
  netOutBytes: number;
  netInStr: string;
  netOutStr: string;
  uptime: string;
  state: string;
};

export function useServerStats() {
  const [stats, setStats] = useState<ServerStats>({
    cpu: 0,
    ram: 0,
    disk: 0,
    netInBytes: 0,
    netOutBytes: 0,
    netInStr: "0.0 KB/s",
    netOutStr: "0.0 KB/s",
    uptime: "0s",
    state: "offline"
  });

  const [history, setHistory] = useState<DataPoint[]>([]);
  
  // Track previous network values to calculate Real-Time KB/s delta
  const prevNetRef = useRef<{ rx: number, tx: number, time: number } | null>(null);
  const previousState = useRef<string>("offline");

  useEffect(() => {
    let isDisposed = false;

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/pterodactyl/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: "/resources", method: "GET" })
        });
        const json = await res.json();
        
        if (!isDisposed && json.attributes) {
          const r = json.attributes.resources;
          const formatBytes = (bytes: number) => {
            if (bytes === 0) return "0.00 KiB";
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KiB";
            if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MiB";
            return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GiB";
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
          const newRam = Number((r.memory_bytes / (1024 * 1024)).toFixed(1)); // Convert to MB
          const newDisk = Number((r.disk_bytes / (1024 * 1024)).toFixed(1));

          const nowTime = Date.now();
          let netInKbps = 0;
          let netOutKbps = 0;

          if (prevNetRef.current) {
            const timeDeltaSec = (nowTime - prevNetRef.current.time) / 1000;
            if (timeDeltaSec > 0) {
              const rxDeltaBytes = Math.max(0, r.network_rx_bytes - prevNetRef.current.rx);
              const txDeltaBytes = Math.max(0, r.network_tx_bytes - prevNetRef.current.tx);
              
              netInKbps = (rxDeltaBytes / 1024) / timeDeltaSec;
              netOutKbps = (txDeltaBytes / 1024) / timeDeltaSec;
            }
          }

          prevNetRef.current = {
            rx: r.network_rx_bytes,
            tx: r.network_tx_bytes,
            time: nowTime
          };

          setStats({
            cpu: newCpu,
            ram: newRam,
            disk: newDisk,
            netInBytes: r.network_rx_bytes,
            netOutBytes: r.network_tx_bytes,
            netInStr: formatBytes(r.network_rx_bytes),
            netOutStr: formatBytes(r.network_tx_bytes),
            uptime: formatUptime(r.uptime),
            state: json.attributes.current_state
          });

          if (json.attributes.current_state !== previousState.current) {
            if (json.attributes.current_state === "running") {
              dispatchNotification("Server Online", "The Pterodactyl server is now running.", "success");
            } else if (json.attributes.current_state === "offline") {
              dispatchNotification("Server Offline", "The Pterodactyl server has stopped.", "warning");
            } else if (json.attributes.current_state === "starting") {
              dispatchNotification("Server Starting", "The Pterodactyl server is booting up.", "info");
            }
            previousState.current = json.attributes.current_state;
          }

          setHistory(prev => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            const newPoint = {
              time: timeStr,
              cpu: newCpu,
              ram: newRam,
              disk: newDisk,
              netIn: Number(netInKbps.toFixed(2)),
              netOut: Number(netOutKbps.toFixed(2))
            };
            const nextHistory = [...prev, newPoint];
            if (nextHistory.length > 20) return nextHistory.slice(1);
            return nextHistory;
          });
        }
      } catch (e) {
        // Silently ignore network errors during polling
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => {
      isDisposed = true;
      clearInterval(interval);
    };
  }, []);

  return { stats, history };
}
