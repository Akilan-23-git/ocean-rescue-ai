import type { Coordinates } from '@/types';

export interface WindData {
  speed: number;
  direction: number;
  gust: number;
  unit: 'knots';
}

export interface OceanCurrentData {
  speed: number;
  direction: number;
  unit: 'knots';
}

export interface WaveData {
  height: number;
  period: number;
  direction: number;
  unit: 'm';
}

export interface TideData {
  level: number;
  state: 'rising' | 'falling' | 'high' | 'low';
  nextHigh: string;
  nextLow: string;
  unit: 'm';
}

export interface VisibilityData {
  distance: number;
  condition: 'excellent' | 'good' | 'moderate' | 'poor' | 'very_poor';
  unit: 'km';
}

export interface ForecastPoint {
  timestamp: string;
  windSpeed: number;
  windDirection: number;
  currentSpeed: number;
  currentDirection: number;
  waveHeight: number;
  temperature: number;
  visibility: number;
}

export interface EnvironmentalSnapshot {
  timestamp: string;
  wind: WindData;
  oceanCurrent: OceanCurrentData;
  waves: WaveData;
  seaTemperature: number;
  tide: TideData;
  visibility: VisibilityData;
}

export interface EnvironmentalData {
  location: Coordinates;
  fetchedAt: string;
  current: EnvironmentalSnapshot;
  weatherForecast: ForecastPoint[];
  currentForecast: ForecastPoint[];
  timeline: ForecastPoint[];
}

export interface EnvironmentalRequest {
  lat: number;
  lng: number;
  incidentTime?: string;
}
