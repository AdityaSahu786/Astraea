"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Sun, Moon, Radio } from "lucide-react";
import {
  EventTypeOption, HistoricalEvent, RoadGraph, ScenarioInput, SimulateResponse,
  Venue, WeatherOption, getEventTypes, getGraph, getHistoricalEvents,
  getMetrics, getReplay, getVenues, getWeatherOptions, simulate
} from "@/lib/api";

import ScenarioPanel from "@/components/ScenarioPanel";
import TimeSlider from "@/components/TimeSlider";
import KpiBar from "@/components/KpiBar";
import TimelineChart from "@/components/TimelineChart";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import AccuracyPanel from "@/components/AccuracyPanel";
import { Badge } from "@/components/ui";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const DEFAULT_SCENARIO: ScenarioInput = {
  venueId: "chinnaswamy", eventType: "cricket", attendance: 36000,
  startHour: 19.5, dow: 5, isHoliday: false, rain: 0, tempC: 28, durationMin: 210, manpowerBudget: 60,
};

export default function Dashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeOption[]>([]);
  const [weatherOptions, setWeatherOptions] = useState<WeatherOption[]>([]);
  const [historical, setHistorical] = useState<HistoricalEvent[]>([]);
  const [graph, setGraph] = useState<RoadGraph | null>(null);
  const [metrics, setMetrics] = useState<any>(null);

  const [scenario, setScenario] = useState<ScenarioInput>(DEFAULT_SCENARIO);
  const [result, setResult] = useState<SimulateResponse | null>(null);
  const [replay, setReplay] = useState<any>(null);
  const [mode, setMode] = useState<"simulate" | "replay">("simulate");

  const [timeIndex, setTimeIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [rightTab, setRightTab] = useState<"plan" | "accuracy">("plan");

  const forecast = mode === "replay" ? replay?.forecast : result?.forecast;
  const plan = mode === "replay" ? replay?.plan : result?.plan;

  const runSimulate = useCallback(async (s: ScenarioInput) => {
    setLoading(true);
    try {
      const r = await simulate(s);
      setResult(r); setReplay(null); setMode("simulate");
      setTimeIndex(r.forecast.peakIndex);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReplay = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const r = await getReplay(id);
      setReplay(r); setMode("replay"); setRightTab("accuracy");
      setTimeIndex(r.forecast.peakIndex);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [v, et, wo, hist, g, m] = await Promise.all([
          getVenues(), getEventTypes(), getWeatherOptions(),
          getHistoricalEvents(), getGraph(), getMetrics().catch(() => null),
        ]);
        setVenues(v); setEventTypes(et); setWeatherOptions(wo);
        setHistorical(hist); setGraph(g); setMetrics(m);
        const r = await simulate(DEFAULT_SCENARIO);
        setResult(r); setTimeIndex(r.forecast.peakIndex);
      } catch (e) {
        console.error(e);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!playing || !forecast) return;
    const id = setInterval(() => setTimeIndex((i) => (i + 1) % forecast.timeline.length), 650);
    return () => clearInterval(id);
  }, [playing, forecast]);

  if (booting) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <div className="text-2xl font-bold">Astr<span className="text-accent">aea</span> Command Center</div>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-edge border-t-accent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-edge bg-panel px-5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black">Astr<span className="text-accent">aea</span></span>
          <span className="text-xs text-muted font-semibold">Event Traffic Command Center · Bengaluru</span>
        </div>
        <div className="flex items-center gap-3">
          {metrics && <Badge color="#71717a"><Radio size={11} className="animate-pulse" /> Model R² {metrics.targets.congestion.r2}</Badge>}
          <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} className="p-2 border border-edge rounded-lg cursor-pointer">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[320px_1fr_360px] overflow-hidden">
        <aside className="panel overflow-hidden">
          <ScenarioPanel
            scenario={scenario} venues={venues} eventTypes={eventTypes} weatherOptions={weatherOptions}
            historical={historical} activeReplayId={mode === "replay" ? replay?.meta?.id : null}
            loading={loading} onChange={(p) => setScenario(s => ({ ...s, ...p }))}
            onRun={() => runSimulate(scenario)} onLoadReplay={loadReplay}
          />
        </aside>

        <main className="flex flex-col gap-4 overflow-hidden">
          {forecast && plan && <KpiBar kpis={forecast.kpis} plan={plan} />}
          <div className="panel relative flex-1 overflow-hidden">
            <MapView forecast={forecast} graph={graph} barricades={plan?.barricades || []} diversions={plan?.diversions || []} officers={plan?.manpower?.officers || []} timeIndex={timeIndex} theme={theme} />
          </div>
          {forecast && (
            <TimeSlider timeline={forecast.timeline} timeIndex={timeIndex} peakIndex={forecast.peakIndex} playing={playing} onScrub={setTimeIndex} onPlayToggle={() => setPlaying(p => !p)} onJumpPeak={() => setTimeIndex(forecast.peakIndex)} />
          )}
          {forecast && (
            <div className="panel h-28 p-2">
              <TimelineChart timeline={forecast.timeline} timeIndex={timeIndex} durationMin={forecast.event.durationMin} onScrub={setTimeIndex} theme={theme} />
            </div>
          )}
        </main>

        <aside className="flex flex-col gap-4 overflow-hidden">
          <div className="flex gap-1 panel p-1">
            <button onClick={() => setRightTab("plan")} className={`flex-1 rounded-lg py-1.5 text-xs font-bold cursor-pointer ${rightTab === "plan" ? "bg-accent text-accent-foreground" : "text-muted"}`}>Deployment Plan</button>
            <button onClick={() => setRightTab("accuracy")} className={`flex-1 rounded-lg py-1.5 text-xs font-bold cursor-pointer ${rightTab === "accuracy" ? "bg-accent text-accent-foreground" : "text-muted"}`}>Accuracy</button>
          </div>
          <div className="panel flex-1 overflow-hidden">
            {rightTab === "plan" && plan ? <RecommendationsPanel plan={plan} /> : <AccuracyPanel metrics={metrics} replay={mode === "replay" ? replay : null} theme={theme} />}
          </div>
        </aside>
      </div>
    </div>
  );
}
