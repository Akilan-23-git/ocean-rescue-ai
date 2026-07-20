export const APP_NAME = 'MSAR';
export const APP_TITLE = 'Maritime Search & Rescue Prediction System';
export const APP_VERSION = '1.0.0';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';
export const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL ?? 'http://localhost:8000/api';

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 72;
export const TOPBAR_HEIGHT = 64;

export const MISSION_ID_PREFIX = 'MSAR';

export const INCIDENT_TYPES = [
  { value: 'man_overboard', label: 'Man Overboard' },
  { value: 'vessel_distress', label: 'Vessel in Distress' },
  { value: 'missing_vessel', label: 'Missing Vessel' },
  { value: 'oil_spill', label: 'Oil Spill' },
  { value: 'container_lost', label: 'Lost Container' },
  { value: 'search_rescue', label: 'Search & Rescue' },
  { value: 'other', label: 'Other' },
] as const;

export const OBJECT_TYPES = [
  { value: 'missing_person', label: 'Missing Person', icon: 'Person' },
  { value: 'fishing_boat', label: 'Fishing Boat', icon: 'DirectionsBoat' },
  { value: 'cargo_ship', label: 'Cargo Ship', icon: 'LocalShipping' },
  { value: 'sail_boat', label: 'Sail Boat', icon: 'Sailing' },
  { value: 'life_raft', label: 'Life Raft', icon: 'Pool' },
  { value: 'oil_spill', label: 'Oil Spill', icon: 'WaterDrop' },
  { value: 'shipping_container', label: 'Shipping Container', icon: 'Inventory2' },
] as const;

export const LIFE_JACKET_STATUS = [
  { value: 'wearing', label: 'Wearing Life Jacket' },
  { value: 'not_wearing', label: 'Not Wearing' },
  { value: 'unknown', label: 'Unknown' },
  { value: 'not_applicable', label: 'Not Applicable' },
] as const;

export const MISSION_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  SIMULATING: 'simulating',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'Dashboard' },
  { path: '/missions/new', label: 'New Simulation', icon: 'AddCircleOutline' },
  { path: '/missions/active', label: 'Active Missions', icon: 'Radar' },
  { path: '/missions/history', label: 'Prediction History', icon: 'History' },
  { path: '/weather', label: 'Weather', icon: 'Cloud' },
  { path: '/ocean-currents', label: 'Ocean Currents', icon: 'Waves' },
  { path: '/analytics', label: 'Analytics', icon: 'Analytics' },
  { path: '/reports', label: 'Reports', icon: 'Description' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
  { path: '/help', label: 'Help', icon: 'HelpOutline' },
] as const;

export const DEFAULT_MAP_CENTER = { lat: 20.0, lng: 60.0 };
export const DEFAULT_MAP_ZOOM = 5;

export const SAMPLE_PORTS = [
  { name: 'Mumbai Port', lat: 18.94, lng: 72.84 },
  { name: 'Chennai Port', lat: 13.1, lng: 80.3 },
  { name: 'Kochi Port', lat: 9.97, lng: 76.27 },
  { name: 'Visakhapatnam Port', lat: 17.69, lng: 83.3 },
  { name: 'Kandla Port', lat: 23.03, lng: 70.22 },
] as const;
