"use client";

import { Kpis, Plan } from "@/lib/api";
import { Badge } from "@/components/ui";
import { AlertTriangle, Clock, MapPin, Shield, Users } from "lucide-react";

interface Props {
  kpis: Kpis;
  plan: Plan;
}

export default function KpiBar({ kpis, plan }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      <div className="panel p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted uppercase tracking-wider">
          <AlertTriangle size={12} className="text-accent" /> Peak Congestion
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight">{kpis.peakCongestion}</span>
          <span className="text-[11px] font-semibold text-muted">/100</span>
        </div>
        <div className="mt-1 text-[11px] font-semibold text-muted">{kpis.peakTimeLabel} ({kpis.peakPhase})</div>
      </div>

      <div className="panel p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted uppercase tracking-wider">
          <MapPin size={12} className="text-blue-500" /> Affected Nodes
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight">{kpis.junctionsAffected}</span>
          <span className="text-[11px] font-semibold text-muted">junctions</span>
        </div>
        <div className="mt-1 text-[11px] font-semibold text-muted truncate">Worst: {kpis.worstJunction || "None"}</div>
      </div>

      <div className="panel p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted uppercase tracking-wider">
          <Users size={12} className="text-emerald-500" /> Police Deployed
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight">{plan.summary.officersDeployed}</span>
          <span className="text-[11px] font-semibold text-muted">/ {plan.summary.manpowerBudget}</span>
        </div>
        <div className="mt-1 text-[11px] font-semibold text-muted">{plan.summary.junctionsStaffed} staffed junctions</div>
      </div>

      <div className="panel p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted uppercase tracking-wider">
          <Shield size={12} className="text-amber-500" /> Control Plan
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight">{plan.summary.barricadePoints}</span>
          <span className="text-[11px] font-semibold text-muted">barricades</span>
        </div>
        <div className="mt-1 text-[11px] font-semibold text-muted">{plan.summary.diversionRoutes} detours suggested</div>
      </div>

      <div className="hidden panel p-3 lg:block">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted uppercase tracking-wider">
          <Clock size={12} className="text-purple-500" /> Impact Radius
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight">{kpis.impactRadiusKm}</span>
          <span className="text-[11px] font-semibold text-muted">km</span>
        </div>
        <div className="mt-1 text-[11px] font-semibold text-muted">Avg Delay: {kpis.avgDelayAtPeak} min</div>
      </div>
    </div>
  );
}
