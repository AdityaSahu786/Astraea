/** Typed client connecting the React frontend to the Astraea FastAPI server. */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export interface Venue {
  id: string; name: string; lat: number; lng: number; capacity: number;
  base_radius_km: number; typicalEvents: string[];
}

export interface EventTypeOption { key: string; label: string; }
export interface WeatherOption { value: number; label: string; }

export interface GraphNode {
  id: string; name: string; lat: number; lng: number; lanes: number;
  baseVolume: number; centrality: number;
}
export interface GraphEdge { from: string; to: string; road: string; lanes: number; lengthKm: number; capacity: number; }
export interface RoadGraph { nodes: GraphNode[]; edges: GraphEdge[]; }

export interface TimelineBucket {
  minutes: number; label: string; phase: "arrival" | "during" | "dispersal";
  clockHour: number; avgCongestion: number; maxCongestion: number;
  totalDelay: number; junctionsAffected: number;
  congestion: Record<string, number>; delta: Record<string, number>; delay: Record<string, number>;
}

export interface PerJunction {
  id: string; name: string; lat: number; lng: number; congestion: number;
  peakCongestion: number; baseline: number; delta: number; delay: number;
  peakMinutes: number; distanceKm: number; centrality: number;
}

export interface Kpis {
  peakCongestion: number; peakTimeLabel: string; peakPhase: string;
  junctionsAffected: number; worstJunction: string | null;
  impactRadiusKm: number; avgDelayAtPeak: number; totalDelayAtPeak: number;
}

export interface Forecast {
  event: any; timeline: TimelineBucket[]; peakIndex: number;
  perJunction: PerJunction[]; kpis: Kpis;
}

export interface ManpowerOfficer {
  junctionId: string; junctionName: string; lat: number; lng: number;
  officers: number; priority: number; peakCongestion: number; eventDelta: number;
  expectedDelayBefore: number; expectedDelayAfter: number; mitigationPct: number; reason: string;
}

export interface Plan {
  manpower: { officers: ManpowerOfficer[]; totalDeployed: number; junctionsStaffed: number };
  barricades: any[]; diversions: any[];
  summary: { officersDeployed: number; junctionsStaffed: number; barricadePoints: number; diversionRoutes: number; manpowerBudget: number };
}

export interface SimulateResponse { forecast: Forecast; plan: Plan; }
export interface ScenarioInput {
  venueId: string; eventType: string; attendance: number; startHour: number;
  dow: number; isHoliday: boolean; rain: number; tempC: number; durationMin: number; manpowerBudget: number;
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export const getVenues = () => getJSON<Venue[]>("/api/venues");
export const getEventTypes = () => getJSON<EventTypeOption[]>("/api/event-types");
export const getWeatherOptions = () => getJSON<WeatherOption[]>("/api/weather-options");
export const getGraph = () => getJSON<RoadGraph>("/api/graph");
export const getMetrics = () => getJSON<any>("/api/metrics");
export const getHistoricalEvents = () => getJSON<any[]>("/api/events");
export const getReplay = (id: string) => getJSON<any>(`/api/events/${id}/replay`);

export async function simulate(input: ScenarioInput): Promise<SimulateResponse> {
  const res = await fetch(`${API_BASE}/api/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`simulate failed: ${res.status}`);
  return res.json();
}
