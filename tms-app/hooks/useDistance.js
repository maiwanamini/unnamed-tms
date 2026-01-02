import useSWR from "swr";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import fetcher from "../lib/_fetcher";

// Haversine formula for straight-line distance (instant fallback)
const haversineKm = (aLat, aLng, bLat, bLng) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const sa = Math.sin(dLat / 2);
  const sb = Math.sin(dLng / 2);
  const aa = sa * sa + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * sb * sb;
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
};

/**
 * Hook to fetch distance between two coordinates
 * Uses Haversine formula for instant display, tries backend for driving distance
 * @param {number} fromLat - Start latitude
 * @param {number} fromLng - Start longitude
 * @param {number} toLat - End latitude
 * @param {number} toLng - End longitude
 * @returns {object} { distanceKm }
 */
export const useDistance = (fromLat, fromLng, toLat, toLng) => {
  const { token } = useAuth();

  // Validate coordinates
  const hasValidCoords =
    Number.isFinite(fromLat) &&
    Number.isFinite(fromLng) &&
    Number.isFinite(toLat) &&
    Number.isFinite(toLng);

  // Haversine calculation (instant, always available)
  const straightLineKm = useMemo(() => {
    if (!hasValidCoords) return null;
    return haversineKm(fromLat, fromLng, toLat, toLng);
  }, [fromLat, fromLng, toLat, toLng, hasValidCoords]);

  // Try to fetch actual driving distance from backend
  const directionsUrl = useMemo(() => {
    if (!hasValidCoords) return null;
    return `${api.geo.directions}?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`;
  }, [fromLat, fromLng, toLat, toLng, hasValidCoords]);

  const { data: directionsData } = useSWR(
    token && directionsUrl ? [directionsUrl, token] : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const drivingKm = Number(directionsData?.distanceKm);

  // Prefer driving distance, fall back to straight line
  const distanceKm = useMemo(() => {
    return Number.isFinite(drivingKm)
      ? drivingKm
      : Number.isFinite(straightLineKm)
      ? straightLineKm
      : null;
  }, [drivingKm, straightLineKm]);

  return { distanceKm };
};
