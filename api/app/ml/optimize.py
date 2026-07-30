"""Recommendation & optimization engine for deployment planning.

Turns a forecast into an actionable deployment plan:
  * manpower   -> greedy marginal-utility allocation of officers to junctions
  * barricades -> inflow-restriction points on the worst corridors near venue
  * diversions -> congestion-aware reroutes for cross-city through traffic
"""

from __future__ import annotations
import networkx as nx

from app.data.graph import JUNCTIONS_BY_ID, build_graph, haversine_km
from app.ml.forecast import AFFECTED_DELTA

_RELIEF_DECAY = 0.80
_MAX_MITIGATION = 0.62
_MAX_PER_JUNCTION = 12

_GATEWAY_PAIRS = [
    ("hebbal", "silk_board"),
    ("yeshwanthpur", "marathahalli"),
    ("kr_puram", "majestic"),
    ("mekhri_circle", "jayanagar"),
    ("hebbal", "koramangala"),
    ("tin_factory", "majestic"),
]


def _coords(node_id: str) -> list[float]:
    j = JUNCTIONS_BY_ID[node_id]
    return [j.lat, j.lng]


def allocate_manpower(per_junction: list[dict], budget: int) -> dict:
    affected = [p for p in per_junction if p["delta"] >= AFFECTED_DELTA]
    if not affected:
        return {"officers": [], "totalDeployed": 0, "junctionsStaffed": 0}

    priority = {
        p["id"]: (p["delta"] / 100.0) * (0.5 + p["congestion"] / 100.0) * (0.5 + 2.0 * p.get("centrality", 0.0))
        for p in affected
    }
    officers = {p["id"]: 0 for p in affected}

    for _ in range(budget):
        best_id, best_gain = None, 0.0
        for jid in officers:
            if officers[jid] >= _MAX_PER_JUNCTION:
                continue
            gain = priority[jid] * (_RELIEF_DECAY ** officers[jid])
            if gain > best_gain:
                best_gain, best_id = gain, jid
        if best_id is None:
            break
        officers[best_id] += 1

    by_id = {p["id"]: p for p in affected}
    result = []
    for jid, n in officers.items():
        if n == 0:
            continue
        p = by_id[jid]
        mitigation = min(_MAX_MITIGATION, 1 - _RELIEF_DECAY ** n)
        result.append({
            "junctionId": jid, "junctionName": p["name"], "lat": p["lat"], "lng": p["lng"],
            "officers": n, "priority": round(priority[jid], 3), "peakCongestion": p["congestion"],
            "eventDelta": p["delta"], "expectedDelayBefore": p["delay"],
            "expectedDelayAfter": round(p["delay"] * (1 - mitigation), 2),
            "mitigationPct": round(mitigation * 100, 0),
            "reason": f"+{p['delta']:.0f} pts event surge" + (", high centrality" if p.get("centrality", 0) >= 0.12 else ""),
        })
    result.sort(key=lambda x: x["officers"], reverse=True)
    return {
        "officers": result,
        "totalDeployed": sum(r["officers"] for r in result),
        "junctionsStaffed": len(result),
    }


def recommend_barricades(per_junction: list[dict], venue_lat: float, venue_lng: float, max_points: int = 5) -> list[dict]:
    g = build_graph()
    delta = {p["id"]: p["delta"] for p in per_junction}
    cong = {p["id"]: p["congestion"] for p in per_junction}

    candidates = []
    for a, b, data in g.edges(data=True):
        impact = (delta.get(a, 0.0) + delta.get(b, 0.0)) / 2.0
        if impact < AFFECTED_DELTA:
            continue
        ja, jb = JUNCTIONS_BY_ID[a], JUNCTIONS_BY_ID[b]
        dist_to_venue = haversine_km((ja.lat + jb.lat) / 2, (ja.lng + jb.lng) / 2, venue_lat, venue_lng)
        proximity = 1.0 / (1.0 + dist_to_venue)
        score = impact * (0.4 + 0.6 * proximity * 3)
        candidates.append((score, impact, dist_to_venue, a, b, data))

    candidates.sort(reverse=True, key=lambda x: x[0])
    chosen, used = [], {}
    for score, impact, dist, a, b, data in candidates:
        if len(chosen) >= max_points:
            break
        if used.get(a, 0) >= 2 or used.get(b, 0) >= 2:
            continue
        used[a], used[b] = used.get(a, 0) + 1, used.get(b, 0) + 1
        worst = a if cong.get(a, 0) >= cong.get(b, 0) else b
        chosen.append({
            "edge": f"{a}__{b}", "road": data["road"],
            "from": JUNCTIONS_BY_ID[a].name, "to": JUNCTIONS_BY_ID[b].name,
            "route": [_coords(a), _coords(b)],
            "action": "Hard barricade + diversion" if impact >= 25 else "One-way / inflow metering",
            "impact": round(impact, 1), "distToVenueKm": round(dist, 2),
            "reason": f"{data['road']} feeds {JUNCTIONS_BY_ID[worst].name} (peak {cong.get(worst, 0):.0f}/100); restrict inflow toward venue.",
        })
    return chosen


def recommend_diversions(per_junction: list[dict], max_routes: int = 4) -> list[dict]:
    g = build_graph()
    delta = {p["id"]: p["delta"] for p in per_junction}

    def cong_weight(u, v, data):
        d = (delta.get(u, 0.0) + delta.get(v, 0.0)) / 2.0
        return data["ff_time_min"] * (1.0 + 3.5 * (d / 100.0))

    def path_time(path) -> float:
        return sum(g[u][v]["ff_time_min"] for u, v in zip(path[:-1], path[1:]))

    diversions, seen = [], set()
    for o, d in _GATEWAY_PAIRS:
        if o not in g or d not in g:
            continue
        try:
            normal = nx.shortest_path(g, o, d, weight="ff_time_min")
            diverted = nx.shortest_path(g, o, d, weight=cong_weight)
        except nx.NetworkXNoPath:
            continue
        if normal == diverted:
            continue
        avoided = [n for n in normal if delta.get(n, 0.0) >= AFFECTED_DELTA and n not in diverted]
        if not avoided or tuple(diverted) in seen:
            continue
        seen.add(tuple(diverted))

        t_normal, t_divert = path_time(normal), path_time(diverted)
        diversions.append({
            "from": JUNCTIONS_BY_ID[o].name, "to": JUNCTIONS_BY_ID[d].name,
            "avoids": [JUNCTIONS_BY_ID[n].name for n in avoided],
            "originalRoute": [_coords(n) for n in normal],
            "suggestedRoute": [_coords(n) for n in diverted],
            "normalTimeMin": round(t_normal, 1), "divertedTimeMin": round(t_divert, 1),
            "extraDistanceMin": round(t_divert - t_normal, 1),
            "reason": f"Through-traffic {JUNCTIONS_BY_ID[o].name} → {JUNCTIONS_BY_ID[d].name} normally crosses {', '.join(JUNCTIONS_BY_ID[n].name for n in avoided)}; reroute to keep event corridor clear.",
        })
        if len(diversions) >= max_routes:
            break
    return diversions


def build_plan(forecast: dict, manpower_budget: int = 60) -> dict:
    per_junction = forecast["perJunction"]
    event = forecast["event"]
    manpower = allocate_manpower(per_junction, manpower_budget)
    barricades = recommend_barricades(per_junction, event["venueLat"], event["venueLng"])
    diversions = recommend_diversions(per_junction)

    return {
        "manpower": manpower,
        "barricades": barricades,
        "diversions": diversions,
        "summary": {
            "officersDeployed": manpower["totalDeployed"],
            "junctionsStaffed": manpower["junctionsStaffed"],
            "barricadePoints": len(barricades),
            "diversionRoutes": len(diversions),
            "manpowerBudget": manpower_budget,
        },
    }
