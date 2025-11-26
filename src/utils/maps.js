
export function buildOsmMapUrl(lat, lon, zoom = 11) {
  if (lat == null || lon == null) return null;
  const delta = 0.25;
  const left = lon - delta;
  const right = lon + delta;
  const bottom = lat - delta;
  const top = lat + delta;

  const bbox = `${left},${bottom},${right},${top}`;
  const marker = `${lat},${lon}`;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${encodeURIComponent(marker)}`;
}
