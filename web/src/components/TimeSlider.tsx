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

  return (
    <div className="panel flex flex-col gap-2 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onPlayToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold shadow-sm transition hover:opacity-90 cursor-pointer"
          >
            {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
          <div>
            <div className="text-[13px] font-black">{current?.label} ({current?.clockHour?.toFixed(2)}h)</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted">{current?.phase} phase</div>
          </div>
        </div>

        <button
          onClick={onJumpPeak}
          className="flex items-center gap-1 rounded-lg border border-edge bg-panel-2 px-2.5 py-1 text-[11px] font-bold text-foreground transition hover:bg-edge cursor-pointer"
        >
          <Zap size={12} className="text-amber-500 fill-amber-500" /> Jump to Peak
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={timeline.length - 1}
        value={timeIndex}
        onChange={(e) => onScrub(Number(e.target.value))}
        className="w-full h-1.5 bg-edge rounded-lg appearance-none cursor-pointer accent-accent"
      />
    </div>
  );
}
