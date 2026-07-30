import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-edge bg-panel p-4 shadow-sm backdrop-blur-md transition-all ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, color = "#71717a" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide transition-colors"
      style={{ backgroundColor: `${color}15`, color: color, borderColor: `${color}30`, borderWidth: 1 }}
    >
      {children}
    </span>
  );
}
