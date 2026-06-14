"use client";

import React from "react";
import { Button } from "./ui/button";
import { Play, Square, RotateCcw, FileText, Settings, Database } from "lucide-react";
import { toast } from "sonner";
import { Card } from "./ui/card";

export function ControlsComponent() {
  const handleAction = async (action: string) => {
    const signal = action.toLowerCase();
    toast(`Sending ${signal} command to server...`);
    try {
      const res = await fetch("/api/pterodactyl/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "/power", method: "POST", data: { signal } })
      });
      if (res.ok) {
        toast.success(`Server ${action} command sent successfully.`);
      } else {
        toast.error(`Failed to send ${action} command.`);
      }
    } catch (e) {
      toast.error(`Error sending command.`);
    }
  };

  return (
    <Card className="flex flex-wrap items-center gap-2 p-3 bg-card/50 backdrop-blur-sm border-border shadow-sm w-full">
      <Button 
        variant="default" 
        className="bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all hover:shadow-md active:scale-95"
        onClick={() => handleAction("Start")}
      >
        <Play size={16} className="mr-2" /> Start
      </Button>
      <Button 
        variant="destructive" 
        className="shadow-sm transition-all hover:shadow-md active:scale-95"
        onClick={() => handleAction("Stop")}
      >
        <Square size={16} className="mr-2 fill-current" /> Stop
      </Button>
      <Button 
        variant="outline" 
        className="shadow-sm transition-all hover:shadow-md active:scale-95"
        onClick={() => handleAction("Restart")}
      >
        <RotateCcw size={16} className="mr-2" /> Restart
      </Button>

      <div className="flex-1" />

      {/* Bot Specific Features */}
      <Button variant="secondary" className="gap-2" onClick={() => toast("Editing bot config...")}>
        <Settings size={16} /> Edit Config
      </Button>
      <Button variant="secondary" className="gap-2" onClick={() => toast("Viewing bot database...")}>
        <Database size={16} /> Database
      </Button>
      <Button variant="ghost" className="gap-2" onClick={() => toast("Exporting logs...")}>
        <FileText size={16} /> Export Logs
      </Button>
    </Card>
  );
}
