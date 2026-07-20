import { MISSION_ID_PREFIX } from '@/constants';

export function generateMissionId(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${MISSION_ID_PREFIX}-${year}${month}${day}-${random}`;
}

export function formatUtcTime(date: Date = new Date()): string {
  return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

export function parseCoordinates(input: string): { lat: number; lng: number } | null {
  const cleaned = input.trim();
  const decimalMatch = cleaned.match(/^(-?\d+\.?\d*)\s*[,;\s]\s*(-?\d+\.?\d*)$/);
  if (decimalMatch) {
    const lat = parseFloat(decimalMatch[1]);
    const lng = parseFloat(decimalMatch[2]);
    if (isValidCoordinate(lat, lng)) return { lat, lng };
  }
  return null;
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function toLocalDateTimeInput(isoString?: string): string {
  const date = isoString ? new Date(isoString) : new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
