export type TimelineEventType =
  | 'created'
  | 'location_set'
  | 'environment'
  | 'simulation'
  | 'prediction'
  | 'search_area'
  | 'tracking'
  | 'decision'
  | 'note'
  | 'attachment'
  | 'status_change'
  | 'archived'
  | 'completed';

export interface MissionTimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
}

export interface MissionNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface MissionAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export type MissionOutcome = 'rescued' | 'not_found' | 'cancelled' | 'ongoing' | 'unknown';

export interface ActualPathPoint {
  lat: number;
  lng: number;
  timestamp: string;
  hour: number;
}

export interface ReplaySnapshot {
  id: string;
  label: string;
  hour: number;
  predicted: { lat: number; lng: number };
  actual?: { lat: number; lng: number };
  createdAt: string;
}

export interface ReplayAnalysis {
  accuracyPercent: number;
  meanErrorKm: number;
  maxErrorKm: number;
  samples: { hour: number; errorKm: number }[];
}

export interface AnalyticsSummary {
  totalMissions: number;
  successfulRescues: number;
  cancelledMissions: number;
  activeMissions: number;
  predictionAccuracy: number;
  averageDriftKm: number;
  averageSearchHours: number;
  objectTypeStats: { type: string; label: string; count: number }[];
  monthlyTrends: { month: string; missions: number; rescues: number }[];
  yearlyTrends: { year: string; missions: number; rescues: number }[];
  weatherImpact: { factor: string; impact: number }[];
  aiModelPerformance: { model: string; accuracy: number; runs: number }[];
}
