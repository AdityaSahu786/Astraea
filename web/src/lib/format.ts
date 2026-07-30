/** Traffic formatting helpers for colors, hours, and days of week. */

export const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const RAIN_LABELS = ["Clear", "Light Rain", "Heavy Rain"];

export function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function congestionColor(index: number): string {
  if (index < 35) return "#34d399"; // Green (Free)
  if (index < 50) return "#a3e635"; // Light Green (Light)
  if (index < 65) return "#facc15"; // Yellow (Moderate)
  if (index < 80) return "#fb923c"; // Orange (Heavy)
  if (index < 90) return "#f43f5e"; // Red (Severe)
  return "#e11d48";                 // # Dark Red (Gridlock)
}

export function congestionLabel(index: number): string {
  if (index < 35) return "Free Flow";
  if (index < 50) return "Light";
  if (index < 65) return "Moderate";
  if (index < 80) return "Heavy";
  if (index < 90) return "Severe";
  return "Gridlock";
}
