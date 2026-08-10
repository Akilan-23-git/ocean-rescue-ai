import type { SimulationConfig, SimulationResult, SearchAreaData } from './simulation';
import type { LiveTrackingState, RescueDecisionData } from './tracking';
import type {
  MissionTimelineEvent,
  MissionNote,
  MissionAttachment,
  MissionOutcome,
  ActualPathPoint,
  ReplaySnapshot,
} from './management';

export type IncidentType =
  | 'man_overboard'
  | 'vessel_distress'
  | 'missing_vessel'
  | 'oil_spill'
  | 'container_lost'
  | 'search_rescue'
  | 'other';

export type ObjectType =
  | 'missing_person'
  | 'fishing_boat'
  | 'cargo_ship'
  | 'sail_boat'
  | 'life_raft'
  | 'oil_spill'
  | 'shipping_container';

export type LifeJacketStatus = 'wearing' | 'not_wearing' | 'unknown' | 'not_applicable';

export type MissionTriggerType = 'MANUAL' | 'SMS' | 'SOS_DEVICE';

export type MissionStatus =
  | 'draft'
  | 'active'
  | 'simulating'
  | 'completed'
  | 'cancelled'
  | 'archived'
  | 'new_emergency'
  | 'needs_review'
  | 'error';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ReferencePoint extends Coordinates {
  id: string;
  label: string;
  timestamp?: string;
}

export interface Mission {
  id: string;
  missionId: string;
  name: string;
  rescueTeamName: string;
  incidentType: IncidentType;
  lastKnownPosition: Coordinates | null;
  incidentDateTime: string;
  objectType: ObjectType;
  numberOfPeople: number;
  lifeJacketStatus: LifeJacketStatus;
  additionalNotes: string;
  status: MissionStatus;
  referencePoints: ReferencePoint[];
  simulationConfig?: SimulationConfig;
  simulationResult?: SimulationResult;
  searchArea?: SearchAreaData;
  liveTracking?: LiveTrackingState;
  rescueDecision?: RescueDecisionData;
  timeline?: MissionTimelineEvent[];
  notes?: MissionNote[];
  attachments?: MissionAttachment[];
  outcome?: MissionOutcome;
  actualPath?: ActualPathPoint[];
  replaySnapshots?: ReplaySnapshot[];
  archivedAt?: string;
  searchHistory?: string[];
  /** Phase A — mission origin */
  triggerType?: MissionTriggerType;
  source?: string;
  rawMessage?: string;
  messageSid?: string;
  locationRequired?: boolean;
  validationErrors?: string[];
  receivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MissionFormData {
  missionId: string;
  name: string;
  rescueTeamName: string;
  incidentType: IncidentType;
  lastKnownPosition: Coordinates | null;
  incidentDateTime: string;
  objectType: ObjectType;
  numberOfPeople: number;
  lifeJacketStatus: LifeJacketStatus;
  additionalNotes: string;
}

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface Port {
  name: string;
  lat: number;
  lng: number;
}

export interface MapLayerVisibility {
  coastline: boolean;
  ports: boolean;
  shippingLanes: boolean;
  referencePoints: boolean;
}
