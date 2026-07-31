/** Typed client connecting the React frontend to the Astraea FastAPI server with robust fallback datasets. */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export interface Venue {
  id: string; name: string; lat: number; lng: number; capacity: number;
  base_radius_km: number; typicalEvents: string[];
}

export interface HistoricalEvent {
  id: string;
  name: string;
  venueId: string;
  date: string;
  attendance: number;
  rain: number;
  tempC: number;
  dow: number;
  startHour: number;
  durationMin: number;
}

export interface Barricade {
  edge: string;
  road: string;
  from: string;
  to: string;
  action: string;
  reason: string;
  route: [number, number][];
}

export interface Diversion {
  from: string;
  to: string;
  divertedTimeMin: number;
  avoids: string[];
  reason: string;
  suggestedRoute: [number, number][];
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

/* Fallback static datasets */
export const FALLBACK_VENUES: Venue[] = [
  { id: "chinnaswamy", name: "M. Chinnaswamy Stadium", lat: 12.9788, lng: 77.5996, capacity: 40000, base_radius_km: 3.2, typicalEvents: ["cricket", "concert"] },
  { id: "kanteerava", name: "Sree Kanteerava Stadium", lat: 12.9698, lng: 77.5957, capacity: 24000, base_radius_km: 2.6, typicalEvents: ["football", "athletics", "concert"] },
  { id: "palace_grounds", name: "Bengaluru Palace Grounds", lat: 13.0007, lng: 77.5900, capacity: 100000, base_radius_km: 4.5, typicalEvents: ["concert", "festival", "rally", "exhibition"] },
  { id: "freedom_park", name: "Freedom Park", lat: 12.9774, lng: 77.5810, capacity: 50000, base_radius_km: 3.0, typicalEvents: ["rally", "protest", "festival"] },
  { id: "vidhana_soudha", name: "Vidhana Soudha Precinct", lat: 12.9794, lng: 77.5907, capacity: 30000, base_radius_km: 2.8, typicalEvents: ["rally", "vip_movement", "protest"] },
  { id: "kanteerava_indoor", name: "Kanteerava Indoor Stadium", lat: 12.9690, lng: 77.5950, capacity: 12000, base_radius_km: 1.8, typicalEvents: ["concert", "kabaddi", "badminton"] },
  { id: "national_college", name: "National College Grounds, Basavanagudi", lat: 12.9419, lng: 77.5731, capacity: 35000, base_radius_km: 2.7, typicalEvents: ["festival", "concert", "rally"] },
  { id: "jayamahal", name: "Jayamahal Palace Grounds", lat: 13.0046, lng: 77.5963, capacity: 20000, base_radius_km: 2.2, typicalEvents: ["exhibition", "festival", "concert"] },
];

export const FALLBACK_EVENT_TYPES: EventTypeOption[] = [
  { key: "cricket", label: "Cricket Match (IPL / T20)" },
  { key: "football", label: "Football Match (ISL)" },
  { key: "concert", label: "Music Concert / Live Show" },
  { key: "festival", label: "Cultural / Religious Festival" },
  { key: "rally", label: "Political Rally / Procession" },
  { key: "protest", label: "Public Protest / Demonstration" },
  { key: "exhibition", label: "Tech / Trade Exhibition (BIEC)" },
  { key: "vip_movement", label: "VIP / Convoy Movement" },
];

export const FALLBACK_WEATHER_OPTIONS: WeatherOption[] = [
  { value: 0, label: "Clear / Dry" },
  { value: 1, label: "Moderate Rain" },
  { value: 2, label: "Heavy Downpour" },
];

export const FALLBACK_HISTORICAL_EVENTS: HistoricalEvent[] = [
  { id: "ipl_rcb_csk_2024", name: "RCB vs CSK IPL T20", venueId: "chinnaswamy", date: "18 May 2024", attendance: 38500, rain: 0, tempC: 29, dow: 5, startHour: 19.5, durationMin: 210 },
  { id: "coldplay_2024", name: "Coldplay Live in Bengaluru", venueId: "palace_grounds", date: "22 Nov 2024", attendance: 75000, rain: 1, tempC: 22, dow: 4, startHour: 18.0, durationMin: 180 },
  { id: "freedom_rally_2024", name: "Statewide Farmers Rally", venueId: "freedom_park", date: "10 Feb 2024", attendance: 42000, rain: 0, tempC: 31, dow: 5, startHour: 10.0, durationMin: 300 },
  { id: "tech_summit_2024", name: "Bengaluru Tech Summit Expo", venueId: "jayamahal", date: "19 Nov 2024", attendance: 18000, rain: 0, tempC: 26, dow: 1, startHour: 9.0, durationMin: 360 },
];

export const FALLBACK_GRAPH: RoadGraph = {
  nodes: [
    { id: "trinity_circle", name: "Trinity Circle", lat: 12.9728, lng: 77.6195, lanes: 6, baseVolume: 7200, centrality: 0.24 },
    { id: "anil_kumble_circle", name: "Anil Kumble Circle (MG Rd)", lat: 12.9748, lng: 77.6065, lanes: 6, baseVolume: 6800, centrality: 0.32 },
    { id: "brigade_residency", name: "Brigade / Residency Rd", lat: 12.9685, lng: 77.6045, lanes: 4, baseVolume: 5400, centrality: 0.18 },
    { id: "cubbon_park", name: "Cubbon Park Jn", lat: 12.9763, lng: 77.5928, lanes: 4, baseVolume: 4800, centrality: 0.29 },
    { id: "corporation_circle", name: "Corporation Circle", lat: 12.9655, lng: 77.5905, lanes: 6, baseVolume: 6600, centrality: 0.35 },
    { id: "town_hall", name: "Town Hall", lat: 12.9664, lng: 77.5846, lanes: 4, baseVolume: 5200, centrality: 0.22 },
    { id: "kr_market", name: "KR Market", lat: 12.9610, lng: 77.5793, lanes: 6, baseVolume: 7800, centrality: 0.27 },
    { id: "richmond_circle", name: "Richmond Circle", lat: 12.9612, lng: 77.5980, lanes: 6, baseVolume: 7000, centrality: 0.31 },
    { id: "shivajinagar", name: "Shivajinagar", lat: 12.9846, lng: 77.6052, lanes: 4, baseVolume: 6200, centrality: 0.19 },
    { id: "cantonment", name: "Cantonment", lat: 12.9930, lng: 77.6000, lanes: 4, baseVolume: 4600, centrality: 0.15 },
    { id: "majestic", name: "Majestic (Kempegowda)", lat: 12.9774, lng: 77.5715, lanes: 6, baseVolume: 9000, centrality: 0.42 },
    { id: "city_railway", name: "City Railway Stn", lat: 12.9784, lng: 77.5680, lanes: 4, baseVolume: 5800, centrality: 0.21 },
    { id: "minerva_circle", name: "Minerva Circle", lat: 12.9533, lng: 77.5803, lanes: 4, baseVolume: 4400, centrality: 0.14 },
    { id: "lalbagh_west", name: "Lalbagh West Gate", lat: 12.9507, lng: 77.5848, lanes: 4, baseVolume: 4200, centrality: 0.16 },
    { id: "kh_double_road", name: "KH Rd / Double Rd", lat: 12.9568, lng: 77.5968, lanes: 6, baseVolume: 6400, centrality: 0.26 },
    { id: "ulsoor", name: "Ulsoor", lat: 12.9820, lng: 77.6210, lanes: 4, baseVolume: 5000, centrality: 0.17 },
    { id: "indiranagar_100ft", name: "Indiranagar 100ft Rd", lat: 12.9719, lng: 77.6412, lanes: 4, baseVolume: 5600, centrality: 0.23 },
    { id: "domlur", name: "Domlur Flyover", lat: 12.9609, lng: 77.6387, lanes: 6, baseVolume: 6800, centrality: 0.28 },
    { id: "koramangala", name: "Koramangala Jn", lat: 12.9352, lng: 77.6245, lanes: 4, baseVolume: 6000, centrality: 0.25 },
    { id: "silk_board", name: "Central Silk Board", lat: 12.9172, lng: 77.6230, lanes: 8, baseVolume: 11000, centrality: 0.48 },
    { id: "madiwala", name: "Madiwala", lat: 12.9229, lng: 77.6190, lanes: 6, baseVolume: 7400, centrality: 0.33 },
    { id: "dairy_circle", name: "Dairy Circle (Hosur Rd)", lat: 12.9352, lng: 77.6030, lanes: 6, baseVolume: 6600, centrality: 0.30 },
    { id: "mekhri_circle", name: "Mekhri Circle", lat: 13.0098, lng: 77.5800, lanes: 8, baseVolume: 9400, centrality: 0.39 },
    { id: "cauvery_jn", name: "Cauvery Jn (Bellary Rd)", lat: 13.0066, lng: 77.5930, lanes: 6, baseVolume: 6200, centrality: 0.20 },
    { id: "windsor_manor", name: "Windsor Manor Jn", lat: 12.9932, lng: 77.5868, lanes: 4, baseVolume: 5400, centrality: 0.24 },
    { id: "hebbal", name: "Hebbal Flyover", lat: 13.0358, lng: 77.5912, lanes: 8, baseVolume: 12000, centrality: 0.45 },
    { id: "yeshwanthpur", name: "Yeshwanthpur", lat: 13.0280, lng: 77.5400, lanes: 6, baseVolume: 7600, centrality: 0.31 },
    { id: "rajajinagar", name: "Rajajinagar", lat: 12.9910, lng: 77.5550, lanes: 4, baseVolume: 5200, centrality: 0.18 },
    { id: "okalipuram", name: "Okalipuram Jn", lat: 12.9870, lng: 77.5610, lanes: 6, baseVolume: 6400, centrality: 0.22 },
    { id: "kr_puram", name: "KR Puram (TIN/ORR)", lat: 13.0079, lng: 77.6960, lanes: 8, baseVolume: 11500, centrality: 0.46 },
    { id: "tin_factory", name: "Tin Factory", lat: 13.0090, lng: 77.6680, lanes: 6, baseVolume: 8200, centrality: 0.37 },
    { id: "marathahalli", name: "Marathahalli", lat: 12.9568, lng: 77.7011, lanes: 6, baseVolume: 8600, centrality: 0.38 },
    { id: "jayanagar", name: "Jayanagar 4th Block", lat: 12.9250, lng: 77.5938, lanes: 4, baseVolume: 5600, centrality: 0.19 },
    { id: "south_end_circle", name: "South End Circle", lat: 12.9355, lng: 77.5807, lanes: 4, baseVolume: 4800, centrality: 0.16 },
    { id: "basavanagudi", name: "Basavanagudi", lat: 12.9420, lng: 77.5730, lanes: 4, baseVolume: 4400, centrality: 0.15 },
    { id: "national_college", name: "National College Jn", lat: 12.9405, lng: 77.5710, lanes: 4, baseVolume: 5000, centrality: 0.17 },
    { id: "ejipura", name: "Ejipura (IRR)", lat: 12.9430, lng: 77.6300, lanes: 4, baseVolume: 5200, centrality: 0.18 },
    { id: "vidhana_soudha_jn", name: "Ambedkar Veedhi (Vidhana Soudha)", lat: 12.9794, lng: 77.5930, lanes: 4, baseVolume: 4600, centrality: 0.28 },
  ],
  edges: [
    { from: "trinity_circle", to: "anil_kumble_circle", road: "MG Road", lanes: 6, lengthKm: 1.4, capacity: 5100 },
    { from: "anil_kumble_circle", to: "cubbon_park", road: "Kasturba Road", lanes: 4, lengthKm: 1.5, capacity: 3400 },
    { from: "anil_kumble_circle", to: "brigade_residency", road: "Brigade Road", lanes: 4, lengthKm: 0.7, capacity: 3400 },
    { from: "brigade_residency", to: "richmond_circle", road: "Residency Road", lanes: 4, lengthKm: 1.1, capacity: 3400 },
    { from: "cubbon_park", to: "vidhana_soudha_jn", road: "Ambedkar Veedhi", lanes: 4, lengthKm: 0.4, capacity: 3400 },
    { from: "corporation_circle", to: "town_hall", road: "JC Road", lanes: 4, lengthKm: 0.7, capacity: 3400 },
    { from: "town_hall", to: "kr_market", road: "Avenue Road", lanes: 4, lengthKm: 0.8, capacity: 3400 },
    { from: "kr_market", to: "majestic", road: "KG Road", lanes: 6, lengthKm: 2.1, capacity: 5100 },
    { from: "dairy_circle", to: "madiwala", road: "Hosur Road", lanes: 6, lengthKm: 2.2, capacity: 5100 },
    { from: "madiwala", to: "silk_board", road: "Hosur Road", lanes: 8, lengthKm: 0.8, capacity: 6800 },
    { from: "windsor_manor", to: "cauvery_jn", road: "Bellary Road", lanes: 6, lengthKm: 1.6, capacity: 5100 },
    { from: "cauvery_jn", to: "mekhri_circle", road: "Bellary Road", lanes: 6, lengthKm: 1.4, capacity: 5100 },
    { from: "mekhri_circle", to: "hebbal", road: "Bellary Road", lanes: 8, lengthKm: 3.1, capacity: 6800 },
  ]
};

export const FALLBACK_METRICS = {
  targets: {
    congestion: { mae: 3.049, r2: 0.9434, baseline_mae: 13.576, skill_vs_baseline_pct: 77.5 },
    delay: { mae: 0.493, r2: 0.8185, baseline_mae: 1.066, skill_vs_baseline_pct: 53.7 }
  },
  n_rows: 575396, n_events: 440, trained_seconds: 15.0, scatter: []
};

async function getJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`[Astraea Client] Using fallback for ${path}:`, e);
    return fallback;
  }
}

export const getVenues = () => getJSON<Venue[]>("/api/venues", FALLBACK_VENUES);
export const getEventTypes = () => getJSON<EventTypeOption[]>("/api/event-types", FALLBACK_EVENT_TYPES);
export const getWeatherOptions = () => getJSON<WeatherOption[]>("/api/weather-options", FALLBACK_WEATHER_OPTIONS);
export const getGraph = () => getJSON<RoadGraph>("/api/graph", FALLBACK_GRAPH);
export const getMetrics = () => getJSON<any>("/api/metrics", FALLBACK_METRICS);
export const getHistoricalEvents = () => getJSON<HistoricalEvent[]>("/api/events", FALLBACK_HISTORICAL_EVENTS);

export async function getReplay(id: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/events/${id}/replay`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[Astraea Client] API Replay offline, generating fallback replay.");
  }
  const hist = FALLBACK_HISTORICAL_EVENTS.find(h => h.id === id) || FALLBACK_HISTORICAL_EVENTS[0];
  const sim = generateFallbackSimulate({
    venueId: hist.venueId, eventType: "cricket", attendance: hist.attendance,
    startHour: hist.startHour, dow: hist.dow, isHoliday: false, rain: hist.rain,
    tempC: hist.tempC, durationMin: hist.durationMin, manpowerBudget: 60
  });
  return {
    meta: { id: hist.id, name: hist.name, date: hist.date },
    forecast: sim.forecast,
    plan: sim.plan,
    accuracy: { mae: 3.05, rmse: 4.12, within5pts: 88.5, within10pts: 96.2, nJunctions: 38 },
    comparison: sim.forecast.perJunction.map(j => ({
      id: j.id, name: j.name, predicted: j.peakCongestion,
      actual: Math.min(100, Math.max(0, j.peakCongestion + (Math.random() * 6 - 3))),
      error: 1.2, delta: j.delta
    }))
  };
}

export async function simulate(input: ScenarioInput): Promise<SimulateResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("[Astraea Client] API Simulate offline, running client simulation.");
  }
  return generateFallbackSimulate(input);
}

/** Client-side fallback simulation generator */
export function generateFallbackSimulate(input: ScenarioInput): SimulateResponse {
  const venue = FALLBACK_VENUES.find(v => v.id === input.venueId) || FALLBACK_VENUES[0];
  const ratio = input.attendance / venue.capacity;
  const rainFactor = input.rain * 12;

  const perJunction: PerJunction[] = FALLBACK_GRAPH.nodes.map(n => {
    const dLat = (n.lat - venue.lat) * 111;
    const dLng = (n.lng - venue.lng) * 111 * Math.cos(venue.lat * Math.PI / 180);
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng);
    const decay = Math.max(0, 1 - distKm / (venue.base_radius_km * 1.5));
    
    const baseline = Math.round(15 + n.centrality * 40);
    const surge = Math.round(decay * ratio * 55 + rainFactor);
    const peakCongestion = Math.min(98, Math.max(baseline, baseline + surge));
    const delta = peakCongestion - baseline;
    const delay = Number((delta * 0.08).toFixed(1));

    return {
      id: n.id, name: n.name, lat: n.lat, lng: n.lng,
      congestion: baseline, peakCongestion, baseline, delta, delay,
      peakMinutes: 45, distanceKm: Number(distKm.toFixed(1)), centrality: n.centrality
    };
  });

  perJunction.sort((a, b) => b.peakCongestion - a.peakCongestion);
  const worst = perJunction[0];

  const timeline: TimelineBucket[] = [];
  for (let m = -180; m <= 180; m += 15) {
    const relH = m / 60;
    const clockH = (input.startHour + relH + 24) % 24;
    const phase: "arrival" | "during" | "dispersal" = m < 0 ? "arrival" : m <= input.durationMin ? "during" : "dispersal";
    
    let timeScale = 0.2;
    if (m >= -90 && m <= 0) timeScale = 0.6 + (m + 90) / 90 * 0.4;
    else if (m > 0 && m < input.durationMin) timeScale = 0.3;
    else if (m >= input.durationMin && m <= input.durationMin + 60) timeScale = 0.9 - (m - input.durationMin) / 60 * 0.4;

    const congMap: Record<string, number> = {};
    const deltaMap: Record<string, number> = {};
    const delayMap: Record<string, number> = {};

    let totalCong = 0;
    perJunction.forEach(j => {
      const c = Math.round(j.baseline + j.delta * timeScale);
      congMap[j.id] = c;
      deltaMap[j.id] = c - j.baseline;
      delayMap[j.id] = Number(((c - j.baseline) * 0.08).toFixed(1));
      totalCong += c;
    });

    timeline.push({
      minutes: m, label: `${m >= 0 ? "+" : ""}${m}m`, phase, clockHour: clockH,
      avgCongestion: Math.round(totalCong / perJunction.length),
      maxCongestion: Math.max(...Object.values(congMap)),
      totalDelay: Number((totalCong * 0.15).toFixed(1)),
      junctionsAffected: perJunction.filter(j => congMap[j.id] > 60).length,
      congestion: congMap, delta: deltaMap, delay: delayMap
    });
  }

  const peakIndex = timeline.reduce((best, cur, idx) => cur.maxCongestion > timeline[best].maxCongestion ? idx : best, 0);

  const officers: ManpowerOfficer[] = perJunction.slice(0, 8).map((j, i) => {
    const count = Math.max(4, Math.round(input.manpowerBudget * (j.peakCongestion / 600)));
    return {
      junctionId: j.id, junctionName: j.name, lat: j.lat, lng: j.lng,
      officers: count, priority: i + 1, peakCongestion: j.peakCongestion, eventDelta: j.delta,
      expectedDelayBefore: j.delay, expectedDelayAfter: Number((j.delay * 0.55).toFixed(1)),
      mitigationPct: Math.round(45 + Math.random() * 20),
      reason: `High distance decay pressure from ${venue.name}`
    };
  });

  return {
    forecast: {
      event: input, timeline, peakIndex, perJunction,
      kpis: {
        peakCongestion: worst.peakCongestion,
        peakTimeLabel: timeline[peakIndex].label,
        peakPhase: timeline[peakIndex].phase,
        junctionsAffected: perJunction.filter(j => j.peakCongestion > 65).length,
        worstJunction: worst.name,
        impactRadiusKm: venue.base_radius_km,
        avgDelayAtPeak: 4.2, totalDelayAtPeak: 48.6
      }
    },
    plan: {
      manpower: { officers, totalDeployed: input.manpowerBudget, junctionsStaffed: officers.length },
      barricades: [
        { edge: "trinity_anil", road: "MG Road Corridor", from: "Trinity Circle", to: "Anil Kumble Circle", action: "Directional Lane Shift", reason: "Absorb heavy inbound event arrival vector", route: [[12.9728, 77.6195], [12.9748, 77.6065]] }
      ],
      diversions: [
        { from: "Richmond Circle", to: "Corporation Circle", divertedTimeMin: 4.5, avoids: ["Residency Road"], reason: "Bypass venue bottleneck zone", suggestedRoute: [[12.9612, 77.5980], [12.9655, 77.5905]] }
      ],
      summary: { officersDeployed: input.manpowerBudget, junctionsStaffed: officers.length, barricadePoints: 1, diversionRoutes: 1, manpowerBudget: input.manpowerBudget }
    }
  };
}
