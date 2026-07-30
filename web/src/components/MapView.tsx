"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import { Barricade, Diversion, Forecast, ManpowerOfficer, RoadGraph } from "@/lib/api";
import { congestionColor, congestionLabel } from "@/lib/format";

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'/>",
    shadowUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'/>",
  });
}

function junctionIcon(cong: number) {
  const color = congestionColor(cong);
  const d = 6 + (cong / 100) * 6;
  return L.divIcon({
    className: "junction-label",
    html: `<div class="jnode-flat" style="--c:${color};--d:${d.toFixed(1)}px"></div>`,
    iconSize: [d, d],
    iconAnchor: [d / 2, d / 2],
  });
}

function officerIcon(n: number) {
  return L.divIcon({
    className: "junction-label",
    html: `<div class="officer-badge-new">${n}</div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const BLR_CENTER: [number, number] = [12.9716, 77.5946];

export default function MapView({
  forecast, graph, barricades, diversions, officers, timeIndex, theme = "dark"
}: any) {
  const bucket = forecast?.timeline[timeIndex];

  return (
    <MapContainer center={BLR_CENTER} zoom={12} className="h-full w-full rounded-2xl overflow-hidden z-0">
      <TileLayer
        url={theme === "dark"
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        }
      />

      {/* Junction Nodes */}
      {graph?.nodes.map((node: any) => {
        const cong = bucket?.congestion[node.id] ?? 25;
        return (
          <Marker key={node.id} position={[node.lat, node.lng]} icon={junctionIcon(cong)}>
            <Tooltip>
              <div className="text-xs font-bold">
                {node.name}<br />
                <span style={{ color: congestionColor(cong) }}>{congestionLabel(cong)} ({cong}/100)</span>
              </div>
            </Tooltip>
          </Marker>
        );
      })}

      {/* Officers */}
      {officers.map((o: any) => (
        <Marker key={`off-${o.junctionId}`} position={[o.lat, o.lng]} icon={officerIcon(o.officers)}>
          <Tooltip><div className="text-xs font-bold">{o.junctionName}: {o.officers} Officers</div></Tooltip>
        </Marker>
      ))}

      {/* Barricade Lines */}
      {barricades.map((b: any, i: number) => (
        <Polyline key={`barr-${i}`} positions={b.route} color="#f59e0b" weight={4} dashArray="6,6" />
      ))}

      {/* Diversion Polyline Detours */}
      {diversions.map((d: any, i: number) => (
        <Polyline key={`div-${i}`} positions={d.suggestedRoute} color="#3b82f6" weight={3} opacity={0.8} />
      ))}
    </MapContainer>
  );
}
