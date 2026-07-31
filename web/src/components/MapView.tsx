"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip } from "react-leaflet";
import { Barricade, Diversion, Forecast, ManpowerOfficer, RoadGraph, Venue } from "@/lib/api";
import { congestionColor, congestionLabel } from "@/lib/format";
import { Layers } from "lucide-react";

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'/>",
    shadowUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'/>",
  });
}

function junctionIcon(cong: number) {
  const color = congestionColor(cong);
  const d = 8 + (cong / 100) * 4;
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
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function stadiumIcon() {
  return L.divIcon({
    className: "junction-label",
    html: `<div style="width:28px;height:28px;background:#f43f5e;border:3px solid #ffffff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(244,63,94,0.8);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const BLR_CENTER: [number, number] = [12.9750, 77.5980];

export default function MapView({
  forecast, graph, barricades, diversions, officers, selectedVenue, timeIndex, theme = "dark"
}: {
  forecast?: Forecast; graph?: RoadGraph | null; barricades?: Barricade[];
  diversions?: Diversion[]; officers?: ManpowerOfficer[]; selectedVenue?: Venue; timeIndex: number; theme?: string;
}) {
  const bucket = forecast?.timeline[timeIndex];
  const venuePos: [number, number] = selectedVenue ? [selectedVenue.lat, selectedVenue.lng] : [12.9788, 77.5996];
  const venueName = selectedVenue ? selectedVenue.name : "M. CHINNASWAMY STADIUM";

  // Map of node position for drawing edges
  const nodeMap = new Map<string, { lat: number; lng: number }>();
  graph?.nodes.forEach(n => nodeMap.set(n.id, { lat: n.lat, lng: n.lng }));

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={BLR_CENTER}
        zoom={12}
        className="h-full w-full z-0 bg-[#09090b]"
        zoomControl={false}
      >
        <TileLayer
          url={
            theme === "dark"
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
        />

        {/* Graph Edges / Road Network Lines */}
        {graph?.edges.map((edge, idx) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;

          const fromCong = bucket?.congestion[edge.from] ?? 30;
          const toCong = bucket?.congestion[edge.to] ?? 30;
          const avgCong = (fromCong + toCong) / 2;
          const color = congestionColor(avgCong);
          const weight = avgCong > 70 ? 4 : 2.5;

          return (
            <Polyline
              key={`edge-${idx}`}
              positions={[
                [fromNode.lat, fromNode.lng],
                [toNode.lat, toNode.lng]
              ]}
              color={color}
              weight={weight}
              opacity={avgCong > 70 ? 0.9 : 0.6}
            />
          );
        })}

        {/* Barricade Lines */}
        {barricades?.map((b, i) => (
          <Polyline
            key={`barr-${i}`}
            positions={b.route}
            color="#f59e0b"
            weight={4}
            dashArray="6, 6"
          />
        ))}

        {/* Diversion Detour Polylines */}
        {diversions?.map((d, i) => (
          <Polyline
            key={`div-${i}`}
            positions={d.suggestedRoute}
            color="#3b82f6"
            weight={3.5}
            opacity={0.85}
          />
        ))}

        {/* Junction Markers */}
        {graph?.nodes.map((node) => {
          const cong = bucket?.congestion[node.id] ?? 25;
          return (
            <Marker key={node.id} position={[node.lat, node.lng]} icon={junctionIcon(cong)}>
              <Tooltip direction="top" offset={[0, -6]}>
                <div className="text-xs font-bold text-white">
                  {node.name}<br />
                  <span style={{ color: congestionColor(cong) }}>
                    {congestionLabel(cong)} ({cong.toFixed(0)}/100)
                  </span>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* Venue Marker */}
        <Marker position={venuePos} icon={stadiumIcon()}>
          <Tooltip direction="top" permanent offset={[0, -16]} className="venue-tooltip-custom">
            <span className="text-[10px] font-black uppercase text-white bg-black/80 px-2 py-0.5 rounded border border-neutral-700">
              {venueName}
            </span>
          </Tooltip>
        </Marker>

        {/* Officer Badges */}
        {officers?.map((o) => (
          <Marker key={`off-${o.junctionId}`} position={[o.lat, o.lng]} icon={officerIcon(o.officers)}>
            <Tooltip direction="top" offset={[0, -10]}>
              <div className="text-xs font-extrabold text-white">
                {o.junctionName}: <span className="text-[#f43f5e]">{o.officers} Officers</span>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Congestion Legend Overlay at Bottom-Left matching Image 3 */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 rounded-xl border border-neutral-800 bg-[#09090b]/90 px-3.5 py-2 backdrop-blur-md text-[11px] font-bold text-neutral-300 shadow-xl">
        <div className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-white">
          <Layers size={13} className="text-neutral-400" />
          <span>CONGESTION</span>
        </div>
        <div className="h-3 w-px bg-neutral-800" />
        <div className="flex items-center gap-2 text-[10.5px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#10b981]" /> Free</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#84cc16]" /> Light</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#eab308]" /> Moderate</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#f97316]" /> Heavy</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Severe</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#f43f5e]" /> Gridlock</span>
        </div>
      </div>
    </div>
  );
}
