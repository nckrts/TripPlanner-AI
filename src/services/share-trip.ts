import type { TripPlan } from "../types/trip";

export function createShareableTrip(trip: TripPlan) {
  const encoded = window.btoa(unescape(encodeURIComponent(JSON.stringify(trip))));
  const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;

  return {
    ...trip,
    status: "shared",
    shareUrl: url,
  } satisfies TripPlan;
}

export function readSharedTripFromUrl() {
  const hash = window.location.hash;
  if (!hash.startsWith("#share=")) {
    return null;
  }

  try {
    const encoded = hash.replace("#share=", "");
    return JSON.parse(decodeURIComponent(escape(window.atob(encoded)))) as TripPlan;
  } catch {
    return null;
  }
}
