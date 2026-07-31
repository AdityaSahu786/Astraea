"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Sun, Moon, Radio, Activity, Sparkles } from "lucide-react";
import {
  EventTypeOption, HistoricalEvent, RoadGraph, ScenarioInput, SimulateResponse,
  Venue, WeatherOption, getEventTypes, getGraph, getHistoricalEvents,
  getMetrics, getReplay, getVenues, getWeatherOptions, simulate,
  FALLBACK_VENUES, FALLBACK_EVENT_TYPES, FALLBACK_WEATHER_OPTIONS,
  FALLBACK_HISTORICAL_EVENTS, FALLBACK_GRAPH, FALLBACK_METRICS
} from "@/lib/api";

import ScenarioPanel from "@/components/ScenarioPanel";
import TimeSlider from "@/components/TimeSlider";
import KpiBar from "@/components/KpiBar";
import TimelineChart from "@/components/TimelineChart";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import AccuracyPanel from "@/components/AccuracyPanel";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const DEFAULT_SCENARIO: ScenarioInput = {
  venueId: "chinnaswamy", eventType: "cricket", attendance: 36000,
  startHour: 19.5, dow: 5, isHoliday: false, rain: 0, tempC: 28, durationMin: 210, manpowerBudget: 60,
};

export default function Dashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [venues, setVenues] = useState<Venue[]>(FALLBACK_VENUES);
  const [eventTypes, setEventTypes] = useState<EventTypeOption[]>(FALLBACK_EVENT_TYPES);
  const [weatherOptions, setWeatherOptions] = useState<WeatherOption[]>(FALLBACK_WEATHER_OPTIONS);
  const [historical, setHistorical] = useState<HistoricalEvent[]>(FALLBACK_HISTORICAL_EVENTS);
  const [graph, setGraph] = useState<RoadGraph | null>(FALLBACK_GRAPH);
  const [metrics, setMetrics] = useState<any>(FALLBACK_METRICS);

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

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

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
          getHistoricalEvents(), getGraph(), getMetrics(),
        ]);
        setVenues(v); setEventTypes(et); setWeatherOptions(wo);
        setHistorical(hist); setGraph(g); setMetrics(m);
        const r = await simulate(DEFAULT_SCENARIO);
        setResult(r); setTimeIndex(r.forecast.peakIndex);
      } catch (e) {
        console.error("Dashboard init error:", e);
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
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center bg-[#09090b] text-white">
        <div className="flex items-center gap-2 text-2xl font-black">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f43f5e] text-white">
            <Activity size={18} />
          </span>
          Astra<span className="text-[#f43f5e]">ea</span>
        </div>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-700 border-t-[#f43f5e]" />
      </div>
    );
  }

  const selectedVenue = venues.find(v => v.id === scenario.venueId);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#09090b] text-neutral-100 antialiased select-none">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-800/80 bg-[#0f0f12] px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f43f5e] text-white">
            <Activity size={15} />
          </div>
          <span className="text-base font-black tracking-tight text-white">
            Astra<span className="text-[#f43f5e]">ea</span>
          </span>
          <span className="ml-2 border-l border-neutral-800 pl-2 text-xs font-semibold text-neutral-400">
            Event Traffic Command Center · Bengaluru
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-neutral-800 bg-[#141418] px-3 py-0.5 text-xs font-semibold text-neutral-400">
            <span>Model R²</span>
            <span className="font-bold text-white">{metrics?.targets?.congestion?.r2 || "0.94"}</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-neutral-800 bg-[#141418] px-3 py-0.5 text-xs font-semibold text-neutral-400">
            Predictive AI v1.0
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#f43f5e]/30 bg-[#f43f5e]/10 px-3 py-0.5 text-xs font-bold text-[#f43f5e]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f43f5e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f43f5e]"></span>
            </span>
            LIVE
          </div>
          <button
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 bg-[#141418] text-neutral-400 hover:text-white transition cursor-pointer"
          >
            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </header>

      {/* Main Grid Layout matching Images 4 & 5 */}
      <div className="grid flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-[310px_1fr_350px] overflow-hidden">
        {/* Left Sidebar */}
        <aside className="panel flex flex-col overflow-hidden bg-[#121215]/90 border-neutral-800">
          <ScenarioPanel
            scenario={scenario} venues={venues} eventTypes={eventTypes} weatherOptions={weatherOptions}
            historical={historical} activeReplayId={mode === "replay" ? replay?.meta?.id : null}
            loading={loading} onChange={(p) => setScenario(s => ({ ...s, ...p }))}
            onRun={() => runSimulate(scenario)} onLoadReplay={loadReplay}
          />
        </aside>

        {/* Center Panel */}
        <main className="flex flex-col gap-3 overflow-hidden">
          {/* Top KPI Cards Row */}
          {forecast && plan && <KpiBar kpis={forecast.kpis} plan={plan} />}

          {/* Center Map Card with Stadium Header Overlay */}
          <div className="panel relative flex-1 overflow-hidden bg-[#121215]/90 border-neutral-800">
            {/* Map Overlay Banner matching image 4 */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-[#09090b]/90 px-4 py-2 backdrop-blur-md shadow-xl max-w-[90%] sm:max-w-md">
              <div>
                <div className="text-xs font-black tracking-wider text-white uppercase">
                  {selectedVenue ? selectedVenue.name : "M. CHINNASWAMY STADIUM"}
                </div>
                <div className="text-[10.5px] font-semibold text-neutral-400">
                  {scenario.eventType.toUpperCase()} · {(scenario.attendance / 1000).toFixed(0)}k attendees · Sat 7:30 PM · Clear
                </div>
              </div>
              <span className="rounded-md bg-neutral-800 px-2 py-0.5 text-[10px] font-bold text-neutral-300">
                Forecast
              </span>
            </div>

            <MapView
              forecast={forecast} graph={graph} barricades={plan?.barricades || []}
              diversions={plan?.diversions || []} officers={plan?.manpower?.officers || []}
              selectedVenue={selectedVenue} timeIndex={timeIndex} theme={theme}
            />
          </div>

          {/* Time Slider Controls Below Map */}
          {forecast && (
            <TimeSlider
              timeline={forecast.timeline} timeIndex={timeIndex} peakIndex={forecast.peakIndex}
              playing={playing} onScrub={setTimeIndex} onPlayToggle={() => setPlaying(p => !p)}
              onJumpPeak={() => setTimeIndex(forecast.peakIndex)}
            />
          )}

          {/* Timeline Chart Below Time Slider */}
          {forecast && (
            <div className="panel h-24 p-2 bg-[#121215]/90 border-neutral-800">
              <TimelineChart
                timeline={forecast.timeline} timeIndex={timeIndex}
                durationMin={forecast.event.durationMin} onScrub={setTimeIndex} theme={theme}
              />
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="flex flex-col gap-3 overflow-hidden">
          <div className="flex gap-1 panel p-1 bg-[#121215]/90 border-neutral-800 shrink-0">
            <button
              onClick={() => setRightTab("plan")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-extrabold transition cursor-pointer ${
                rightTab === "plan" ? "bg-[#f43f5e] text-white shadow-md" : "text-neutral-400 hover:text-white"
              }`}
            >
              Deployment Plan
            </button>
            <button
              onClick={() => setRightTab("accuracy")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-extrabold transition cursor-pointer ${
                rightTab === "accuracy" ? "bg-[#f43f5e] text-white shadow-md" : "text-neutral-400 hover:text-white"
              }`}
            >
              Accuracy
            </button>
          </div>
          <div className="panel flex-1 overflow-hidden bg-[#121215]/90 border-neutral-800">
            {rightTab === "plan" && plan ? (
              <RecommendationsPanel plan={plan} />
            ) : (
              <AccuracyPanel metrics={metrics} replay={mode === "replay" ? replay : null} theme={theme} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
