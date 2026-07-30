"use client";

import { EventTypeOption, HistoricalEvent, ScenarioInput, Venue, WeatherOption } from "@/lib/api";
import { DOW_LABELS, formatHour } from "@/lib/format";
import { Play, RotateCcw } from "lucide-react";

interface Props {
  scenario: ScenarioInput;
  venues: Venue[];
  eventTypes: EventTypeOption[];
  weatherOptions: WeatherOption[];
  historical: HistoricalEvent[];
  activeReplayId: string | null;
  loading: boolean;
  onChange: (patch: Partial<ScenarioInput>) => void;
  onRun: () => void;
  onLoadReplay: (id: string) => void;
}

export default function ScenarioPanel({
  scenario, venues, eventTypes, weatherOptions, historical, activeReplayId, loading, onChange, onRun, onLoadReplay
}: Props) {
  const currentVenue = venues.find((v) => v.id === scenario.venueId);

  return (
    <div className="flex h-full flex-col p-4 overflow-y-auto space-y-4 text-[12px]">
      <div className="font-extrabold uppercase tracking-wider text-foreground">Scenario Simulator</div>

      {/* Historical Replay Selector */}
      {historical.length > 0 && (
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Past Event Replay</label>
          <select
            value={activeReplayId || ""}
            onChange={(e) => e.target.value && onLoadReplay(e.target.value)}
            className="w-full rounded-xl border border-edge bg-panel-2 p-2 text-[11px] font-bold text-foreground"
          >
            <option value="">-- Select Historical Event --</option>
            {historical.map((h) => (
              <option key={h.id} value={h.id}>{h.name} ({h.date})</option>
            ))}
          </select>
        </div>
      )}

      {/* Venue Select */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Venue</label>
        <select
          value={scenario.venueId}
          onChange={(e) => onChange({ venueId: e.target.value })}
          className="w-full rounded-xl border border-edge bg-panel-2 p-2 text-[11px] font-bold text-foreground"
        >
          {venues.map((v) => (
            <option key={v.id} value={v.id}>{v.name} ({v.capacity.toLocaleString()} cap)</option>
          ))}
        </select>
      </div>

      {/* Event Type Select */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Event Type</label>
        <select
          value={scenario.eventType}
          onChange={(e) => onChange({ eventType: e.target.value })}
          className="w-full rounded-xl border border-edge bg-panel-2 p-2 text-[11px] font-bold text-foreground"
        >
          {eventTypes.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Attendance Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-muted">Attendance</span>
          <span>{scenario.attendance.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={1000}
          max={currentVenue ? Math.round(currentVenue.capacity * 1.25) : 100000}
          step={1000}
          value={scenario.attendance}
          onChange={(e) => onChange({ attendance: Number(e.target.value) })}
          className="w-full h-1.5 bg-edge rounded-lg appearance-none cursor-pointer accent-accent"
        />
      </div>

      {/* Start Hour Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-muted">Start Time</span>
          <span>{formatHour(scenario.startHour)}</span>
        </div>
        <input
          type="range" min={6} max={23} step={0.5}
          value={scenario.startHour}
          onChange={(e) => onChange({ startHour: Number(e.target.value) })}
          className="w-full h-1.5 bg-edge rounded-lg appearance-none cursor-pointer accent-accent"
        />
      </div>

      {/* Rain Select */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Weather</label>
        <select
          value={scenario.rain}
          onChange={(e) => onChange({ rain: Number(e.target.value) })}
          className="w-full rounded-xl border border-edge bg-panel-2 p-2 text-[11px] font-bold text-foreground"
        >
          {weatherOptions.map((w) => (
            <option key={w.value} value={w.value}>{w.label}</option>
          ))}
        </select>
      </div>

      {/* Officers Budget */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-muted">Staffing Budget</span>
          <span>{scenario.manpowerBudget} officers</span>
        </div>
        <input
          type="range" min={0} max={150} step={5}
          value={scenario.manpowerBudget}
          onChange={(e) => onChange({ manpowerBudget: Number(e.target.value) })}
          className="w-full h-1.5 bg-edge rounded-lg appearance-none cursor-pointer accent-accent"
        />
      </div>

      {/* Run Button */}
      <button
        onClick={onRun}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent p-3 text-[12px] font-bold text-accent-foreground transition hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md"
      >
        <Play size={14} className="fill-current" /> {loading ? "Simulating..." : "Run Forecast & Plan"}
      </button>
    </div>
  );
}
