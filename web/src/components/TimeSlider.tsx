"use client";

import { TimelineBucket } from "@/lib/api";
import { Play, Pause, Zap } from "lucide-react";

interface Props {
  timeline: TimelineBucket[];
  timeIndex: number;
  peakIndex: number;
  playing: boolean;
  onScrub: (index: number) => void;
  onPlayToggle: () => void;
  onJumpPeak: () => void;
}

export default function TimeSlider({
  timeline, timeIndex, peakIndex, playing, onScrub, onPlayToggle, onJumpPeak
}: Props) {
  const current = timeline[timeIndex] || timeline[0];

  const pct = (timeIndex / Math.max(1, timeline.length - 1)) * 100;

  return (
    <div className="panel flex flex-col gap-2 p-3 bg-[#121215]/90 border-neutral-800 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayToggle}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f43f5e] text-white font-bold shadow-md hover:bg-[#e11d48] transition cursor-pointer"
          >
            {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" fill="currentColor" />}
          </button>

          <button
            onClick={onJumpPeak}
            className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-[#18181c] px-2.5 py-1 text-xs font-bold text-neutral-300 hover:text-white transition cursor-pointer"
          >
            <Zap size={12} className="text-[#f43f5e]" /> Peak
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white">{current?.label}</span>
            <span className="text-xs font-semibold text-neutral-400">
              {current?.clockHour ? `${Math.floor(current.clockHour)}:${Math.round((current.clockHour % 1) * 60).toString().padStart(2, "0")} PM` : ""}
            </span>
            <span className="rounded-md bg-neutral-800 px-2 py-0.5 text-[10.5px] font-bold text-neutral-300 capitalize">
              {current?.phase} surge
            </span>
          </div>
        </div>

        <div className="text-xs font-bold text-neutral-400">
          avg <span className="text-white font-extrabold">{current?.avgCongestion.toFixed(0)}</span> · peak <span className="text-white font-extrabold">{current?.maxCongestion.toFixed(0)}</span> · <span className="text-white font-extrabold">{current?.junctionsAffected}</span> jns
        </div>
      </div>

      <div className="relative flex items-center h-4 w-full">
        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-neutral-800" />
        <div
          className="absolute left-0 h-1.5 rounded-full bg-[#f43f5e]"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={0}
          max={timeline.length - 1}
          value={timeIndex}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="absolute inset-x-0 w-full h-full cursor-pointer opacity-100"
        />
      </div>
    </div>
  );
}
