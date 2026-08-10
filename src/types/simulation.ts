export type SimulationDuration = 6 | 12 | 24 | 48 | 72;
export type DriftModel = 'opendrift' | 'leeway' | 'hybrid';
export type WeatherSource = 'gfs' | 'ecmwf' | 'icon';
export type OceanModel = 'hycom' | 'cmems' | 'rtofs';
export type AccuracyLevel = 'fast' | 'balanced' | 'high';
export type AiModel = 'lstm-drift' | 'transformer-ocean' | 'ensemble-v2';
export type SimulationRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface SimulationConfig {
  durationHours: SimulationDuration;
  particleCount: number;
  driftModel: DriftModel;
  weatherSource: WeatherSource;
  oceanModel: OceanModel;
  accuracyLevel: AccuracyLevel;
  aiModel: AiModel;
}

export interface TrajectoryPoint {
  lat: number;
  lng: number;
  timestamp: string;
  hour: number;
}

export interface PredictionPath {
  id: string;
  points: TrajectoryPoint[];
  probability: number;
}

export interface EstimatedArrival {
  lat: number;
  lng: number;
  probability: number;
  eta: string;
  label: string;
}

export interface SimulationResult {
  id: string;
  startedAt: string;
  completedAt: string | null;
  progress: number;
  status: SimulationRunStatus;
  primaryPath: PredictionPath;
  alternatePaths: PredictionPath[];
  driftDistanceKm: number;
  driftDirection: number;
  confidenceScore: number;
  estimatedArrivals: EstimatedArrival[];
  aiExplanation: string;
}

export type ProbabilityLevel = 'high' | 'medium' | 'low';

export interface ProbabilityZone {
  id: string;
  level: ProbabilityLevel;
  center: { lat: number; lng: number };
  radiusKm: number;
  probability: number;
  searchOrder: number;
}

export interface SearchGridCell {
  id: string;
  center: { lat: number; lng: number };
  sizeKm: number;
  priority: number;
  probability: number;
}

export interface ProbabilityEllipse {
  center: { lat: number; lng: number };
  semiMajorKm: number;
  semiMinorKm: number;
  rotation: number;
}

export interface SearchAreaData {
  zones: ProbabilityZone[];
  gridCells: SearchGridCell[];
  ellipse: ProbabilityEllipse;
  searchRadiusKm: number;
  recommendedOrder: string[];
}
