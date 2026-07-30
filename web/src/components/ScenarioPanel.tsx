"use client";

import {
  CalendarDays,
  CloudRain,
  History,
  Play,
  Users,
  Zap,
} from "lucide-react";

import {
  EventTypeOption,
  HistoricalEvent,
  ScenarioInput,
  Venue,
  WeatherOption,
} from "@/lib/api";
import { DOW_LABELS, formatHour } from "@/lib/format";

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

const selectClass =
  "w-full rounded-xl border border-neutral-800 bg-[#18181c] px-3 py-2 text-xs font-semibold text-neutral-200 outline-none focus:border-[#f43f5e] transition cursor-pointer";

export default function ScenarioPanel({
  scenario,
  venues,
  eventTypes,
  weatherOptions,
  historical,
  activeReplayId,
  loading,
  onChange,
  onRun,
  onLoadReplay,
}: Props) {
  const venue = venues.find((v) => v.id === scenario.venueId);
  const maxAttendance = venue ? Math.round(venue.capacity * 1.25) : 100000;
  const ratio = venue ? Math.round((scenario.attendance / venue.capacity) * 100) : 0;

  return (
    <div className="flex flex-col gap-3.5 p-4 lg:h-full lg:overflow-y-auto scroll-thin select-none">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            Plan an Event
          </h3>
          <Zap size={14} className="text-[#f43f5e]" />
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-400 font-medium">
          Configure an event scenario. The model forecasts congestion across the
          city and recommends a deployment plan.
        </p>
      </div>

      {/* Venue Select */}
      <div>
        <label className="mb-1 block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          Venue
        </label>
        <select
          className={selectClass}
          value={scenario.venueId}
          onChange={(e) => onChange({ venueId: e.target.value })}
        >
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({(v.capacity / 1000).toFixed(0)}k)
            </option>
          ))}
        </select>
      </div>

      {/* Event Type Select */}
      <div>
        <label className="mb-1 block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          Event type
        </label>
        <select
          className={selectClass}
          value={scenario.eventType}
          onChange={(e) => onChange({ eventType: e.target.value })}
        >
          {eventTypes.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Expected Attendance Slider */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Expected attendance
          </span>
          <span className="rounded-md bg-neutral-800/80 px-2 py-0.5 text-[11px] font-extrabold text-white">
            {(scenario.attendance / 1000).toFixed(0)}k - {ratio}% cap
          </span>
        </div>
        <div className="relative flex items-center h-4 w-full">
          <div className="absolute left-0 right-0 h-1 rounded-full bg-neutral-800" />
          <div
            className="absolute left-0 h-1 rounded-full bg-[#f43f5e]"
            style={{ width: `${((scenario.attendance - 1000) / (maxAttendance - 1000)) * 100}%` }}
          />
          <input
            type="range"
            min={1000}
            max={maxAttendance}
            step={1000}
            value={scenario.attendance}
            onChange={(e) => onChange({ attendance: Number(e.target.value) })}
            className="absolute inset-x-0 w-full h-full cursor-pointer opacity-100"
          />
        </div>
      </div>

      {/* Start Time Slider */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Start time
          </span>
          <span className="rounded-md bg-neutral-800/80 px-2 py-0.5 text-[11px] font-extrabold text-white">
            {formatHour(scenario.startHour)}
          </span>
        </div>
        <div className="relative flex items-center h-4 w-full">
          <div className="absolute left-0 right-0 h-1 rounded-full bg-neutral-800" />
          <div
            className="absolute left-0 h-1 rounded-full bg-[#f43f5e]"
            style={{ width: `${((scenario.startHour - 5.5) / (23 - 5.5)) * 100}%` }}
          />
          <input
            type="range"
            min={5.5}
            max={23}
            step={0.5}
            value={scenario.startHour}
            onChange={(e) => onChange({ startHour: Number(e.target.value) })}
            className="absolute inset-x-0 w-full h-full cursor-pointer opacity-100"
          />
        </div>
      </div>

      {/* Day & Duration */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="mb-1 block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Day
          </label>
          <select
            className={selectClass}
            value={scenario.dow}
            onChange={(e) => onChange({ dow: Number(e.target.value) })}
          >
            {DOW_LABELS.map((d, i) => (
              <option key={i} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Duration
          </label>
          <select
            className={selectClass}
            value={scenario.durationMin}
            onChange={(e) => onChange({ durationMin: Number(e.target.value) })}
          >
            {[60, 90, 120, 150, 180, 210, 240, 300, 360].map((m) => (
              <option key={m} value={m}>
                {Math.floor(m / 60)}h {m % 60 ? `${m % 60}m` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Weather Segmented Pills */}
      <div>
        <label className="mb-1 block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          Weather
        </label>
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-neutral-800 bg-[#18181c] p-1">
          {weatherOptions.map((w) => {
            const active = scenario.rain === w.value;
            return (
              <button
                key={w.value}
                onClick={() => onChange({ rain: w.value })}
                className={`rounded-lg py-1.5 text-[11px] font-bold transition cursor-pointer ${
                  active
                    ? "bg-[#f43f5e] text-white shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {w.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Public Holiday Checkbox */}
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-800 bg-[#18181c] px-3 py-2 transition hover:bg-neutral-800/40">
        <span className="flex items-center gap-2 text-xs font-bold text-neutral-300">
          <CalendarDays size={14} className="text-neutral-400" /> Public holiday
        </span>
        <input
          type="checkbox"
          checked={scenario.isHoliday}
          onChange={(e) => onChange({ isHoliday: e.target.checked })}
          className="h-4 w-4 accent-[#f43f5e] cursor-pointer"
        />
      </label>

      {/* Manpower Budget Slider */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Manpower budget (officers)
          </span>
          <span className="rounded-md bg-neutral-800/80 px-2 py-0.5 text-[11px] font-extrabold text-white">
            {scenario.manpowerBudget}
          </span>
        </div>
        <div className="relative flex items-center h-4 w-full">
          <div className="absolute left-0 right-0 h-1 rounded-full bg-neutral-800" />
          <div
            className="absolute left-0 h-1 rounded-full bg-[#f43f5e]"
            style={{ width: `${(scenario.manpowerBudget / 200) * 100}%` }}
          />
          <input
            type="range"
            min={0}
            max={200}
            step={5}
            value={scenario.manpowerBudget}
            onChange={(e) => onChange({ manpowerBudget: Number(e.target.value) })}
            className="absolute inset-x-0 w-full h-full cursor-pointer opacity-100"
          />
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={onRun}
        disabled={loading}
        className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#f43f5e] px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#e11d48] active:scale-[0.98] shadow-lg shadow-[#f43f5e]/25 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          "Forecasting…"
        ) : (
          <>
            <Play size={14} fill="currentColor" /> Run Forecast &amp; Plan
          </>
        )}
      </button>

      {/* Replay Real Events Section */}
      <div className="mt-2 border-t border-neutral-800/80 pt-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            Replay Real Events
          </h3>
          <History size={14} className="text-neutral-400" />
        </div>
        <p className="mt-1 mb-2 text-[11px] leading-relaxed text-neutral-400 font-medium">
          Post-event learning: compare the model&apos;s forecast against observed
          outcomes for past Bengaluru events.
        </p>
        <div className="flex flex-col gap-2">
          {historical.map((h) => {
            const active = activeReplayId === h.id;
            return (
              <button
                key={h.id}
                onClick={() => onLoadReplay(h.id)}
                className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                  active
                    ? "border-[#f43f5e]/60 bg-[#f43f5e]/15 shadow-md"
                    : "border-neutral-800 bg-[#18181c] hover:border-neutral-700 hover:bg-neutral-800/40"
                }`}
              >
                <div className="text-xs font-bold text-white">
                  {h.name}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10.5px] text-neutral-400 font-semibold">
                  <span>{h.date}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Users size={10} /> {(h.attendance / 1000).toFixed(0)}k
                  </span>
                  {h.rain > 0 && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[#f43f5e]">
                        <CloudRain size={10} /> rain
                      </span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
