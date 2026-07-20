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

export type MissionStatus = 'draft' | 'active' | 'simulating' | 'completed' | 'cancelled';

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
