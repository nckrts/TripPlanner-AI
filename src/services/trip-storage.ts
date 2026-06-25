import type { AuthUser, TripPlan } from "../types/trip";

const userKey = "tripplanner-ai:user";
const tripsKey = "tripplanner-ai:trips";

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = <T>(key: string, value: T) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const tripStorage = {
  getUser() {
    return readJson<AuthUser | null>(userKey, null);
  },

  saveUser(user: AuthUser) {
    writeJson(userKey, user);
  },

  clearUser() {
    window.localStorage.removeItem(userKey);
  },

  listTrips() {
    return readJson<TripPlan[]>(tripsKey, []);
  },

  saveTrip(trip: TripPlan) {
    const now = new Date().toISOString();
    const trips = tripStorage.listTrips();
    const nextTrip = {
      ...trip,
      createdAt: trip.createdAt ?? now,
      updatedAt: now,
      status: trip.status ?? "generated",
    } satisfies TripPlan;
    const nextTrips = trips.some((item) => item.id === trip.id)
      ? trips.map((item) => (item.id === trip.id ? nextTrip : item))
      : [nextTrip, ...trips];
    writeJson(tripsKey, nextTrips);
    return nextTrip;
  },

  updateTrip(tripId: string, updater: (trip: TripPlan) => TripPlan) {
    const trips = tripStorage.listTrips();
    const nextTrips = trips.map((trip) => (trip.id === tripId ? updater(trip) : trip));
    writeJson(tripsKey, nextTrips);
    return nextTrips.find((trip) => trip.id === tripId) ?? null;
  },
};
