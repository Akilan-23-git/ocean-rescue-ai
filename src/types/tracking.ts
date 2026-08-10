export type TrackingStatus = 'idle' | 'running' | 'paused' | 'completed' | 'replaying';

export interface LiveConditions {
  windSpeed: number;
  windDirection: number;
  currentSpeed: number;
  currentDirection: number;
  updatedAt: string;
}

export interface LiveTrackingState {
  status: TrackingStatus;
  currentHour: number;
  maxHour: number;
  currentPosition: { lat: number; lng: number };
  countdownEndsAt: string | null;
  startedAt: string | null;
  pausedAt: string | null;
  conditions: LiveConditions;
  autoRefresh: boolean;
}

export interface RescueStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  etaMinutes: number;
  type: 'coast_guard' | 'naval' | 'port_authority';
}

export interface PatrolVessel {
  id: string;
  name: string;
  callSign: string;
  lat: number;
  lng: number;
  distanceKm: number;
  etaMinutes: number;
  status: 'available' | 'en_route' | 'on_scene';
}

export interface SearchZoneRecommendation {
  id: string;
  name: string;
  priority: number;
  probability: number;
  estimatedSearchHours: number;
  lat: number;
  lng: number;
  radiusKm: number;
}

export interface RiskAlert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface RescueDecisionData {
  generatedAt: string;
  searchZones: SearchZoneRecommendation[];
  closestStation: RescueStation;
  nearestVessel: PatrolVessel;
  recommendedRoute: { lat: number; lng: number }[];
  searchExpansionKm: number;
  totalEstimatedSearchHours: number;
  riskAlerts: RiskAlert[];
  weatherWarnings: RiskAlert[];
  aiRecommendations: string[];
}
