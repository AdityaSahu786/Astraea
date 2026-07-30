"""Dataset synthesis & curated historical events for post-event analysis."""

from __future__ import annotations
import numpy as np
import pandas as pd

from app.data.graph import JUNCTIONS
from app.data.venues import VENUES
from app.ml.features import (
    EVENT_TYPES, Event, FEATURE_COLUMNS, build_feature_row,
    ground_truth, timeline_offsets
)


def sample_event(rng: np.random.Generator) -> Event:
    venue = VENUES[rng.integers(len(VENUES))]
    all_types = list(EVENT_TYPES.keys())
    candidates = all_types if rng.random() < 0.50 else ([t for t in venue.typical_events if t in EVENT_TYPES] or all_types)
    event_type = candidates[rng.integers(len(candidates))]

    ratio = float(np.clip(rng.beta(3.0, 2.0) * 1.25, 0.15, 1.25))
    attendance = int(venue.capacity * ratio)

    start_hour = float(round(rng.uniform(9.0, 21.0), 2)) if rng.random() < 0.7 else float(round(rng.uniform(5.5, 23.0), 2))
    dow = int(rng.integers(0, 7))
    is_holiday = bool(rng.random() < 0.12)
    rain = int(rng.choice([0, 0, 0, 1, 1, 2], p=[0.4, 0.15, 0.1, 0.18, 0.1, 0.07]))
    temp_c = float(round(rng.normal(26, 3), 1))
    duration_min = int(rng.choice([120, 150, 180, 210, 240, 300]))

    return Event(
        venue_id=venue.id, event_type=event_type, attendance=attendance,
        start_hour=start_hour, dow=dow, is_holiday=is_holiday,
        rain=rain, temp_c=temp_c, duration_min=duration_min
    )


def expand_event(event: Event, rng: np.random.Generator | None) -> list[list[float]]:
    rows: list[list[float]] = []
    offsets = timeline_offsets(event.duration_min)
    for j in JUNCTIONS:
        for m in offsets:
            feats = build_feature_row(event, j.id, m)
            cong, delay = ground_truth(event, j.id, m, rng=rng)
            rows.append(feats + [cong, delay])
    return rows


def generate_dataset(n_events: int = 220, seed: int = 7) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    all_rows: list[list[float]] = []
    for idx in range(n_events):
        event = sample_event(rng)
        for row in expand_event(event, rng):
            all_rows.append(row + [float(idx)])

    cols = FEATURE_COLUMNS + ["congestion", "delay", "event_idx"]
    return pd.DataFrame(all_rows, columns=cols)


# Curated historical events for post-event learning replay
HISTORICAL_EVENTS = [
    {
        "id": "hist_rcb_ipl",
        "name": "RCB vs CSK — IPL Night Match",
        "date": "2025-04-26",
        "event": Event("chinnaswamy", "cricket", 38000, 19.5, 5, False, 0, 28.0, 210),
    },
    {
        "id": "hist_palace_concert",
        "name": "Arijit Singh Live @ Palace Grounds",
        "date": "2025-02-15",
        "event": Event("palace_grounds", "concert", 65000, 19.0, 5, False, 1, 24.0, 180),
    },
    {
        "id": "hist_freedom_rally",
        "name": "Farmers' Rally @ Freedom Park",
        "date": "2025-03-10",
        "event": Event("freedom_park", "rally", 42000, 10.0, 0, False, 0, 30.0, 240),
    },
    {
        "id": "hist_kanteerava_derby",
        "name": "Bengaluru FC Derby @ Kanteerava",
        "date": "2025-01-18",
        "event": Event("kanteerava", "football", 22000, 19.5, 5, False, 0, 25.0, 150),
    },
]


def simulate_actuals(event: Event, seed: int) -> dict:
    rng = np.random.default_rng(seed)
    offsets = timeline_offsets(event.duration_min)
    peak: dict[str, dict] = {}
    for j in JUNCTIONS:
        best_c = max(ground_truth(event, j.id, m, rng=None)[0] for m in offsets)
        obs_c = float(np.clip(best_c + rng.normal(0.0, 3.5), 0.0, 100.0))
        cfrac = obs_c / 100.0
        lane_factor = min(max(4.0 / j.lanes, 0.5), 2.0)
        obs_d = max(0.0, 0.4 + 15.0 * (cfrac ** 2.2) * lane_factor + rng.normal(0.0, 0.5))
        peak[j.id] = {"congestion": round(obs_c, 1), "delay": round(obs_d, 2)}
    return peak
