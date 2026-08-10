export const LAPTOP_MIN_WIDTH = 1280;
export const LAPTOP_CONTENT_MAX_WIDTH = 1440;
export const LAPTOP_MAP_HEIGHT = 520;
export const LAPTOP_PANEL_WIDTH = 380;
export const LAPTOP_WORKFLOW_HEIGHT = 56;
export const LAPTOP_MAIN_PADDING = 20;

export const MISSION_WORKFLOW_STEPS = [
  { phase: 1, label: 'Mission', path: 'new' },
  { phase: 2, label: 'Location', path: 'location' },
  { phase: 3, label: 'Environment', path: 'environment' },
  { phase: 4, label: 'Simulation', path: 'simulation' },
  { phase: 5, label: 'Prediction', path: 'prediction' },
  { phase: 6, label: 'Search Area', path: 'search-area' },
] as const;

export const SIMULATION_DURATIONS = [6, 12, 24, 48, 72] as const;

export const DRIFT_MODELS = [
  { value: 'opendrift_lagrangian', label: 'OpenDrift Lagrangian', description: 'Standard particle-based drift model' },
  { value: 'leeway', label: 'Leeway Model', description: 'Includes wind-driven object leeway' },
  { value: 'oceanparcels', label: 'OceanParcels', description: 'High-resolution ocean parcel tracking' },
  { value: 'hybrid_ai', label: 'Hybrid AI-Physics', description: 'AI-enhanced physics model' },
] as const;

export const WEATHER_SOURCES = [
  { value: 'gfs', label: 'NOAA GFS', description: 'Global Forecast System' },
  { value: 'ecmwf', label: 'ECMWF', description: 'European Centre medium-range' },
  { value: 'icon', label: 'DWD ICON', description: 'German weather service' },
  { value: 'local_meteo', label: 'Local Meteo API', description: 'Regional coast guard feed' },
] as const;

export const OCEAN_MODELS = [
  { value: 'hycom', label: 'HYCOM', description: 'Hybrid Coordinate Ocean Model' },
  { value: 'cmems', label: 'CMEMS', description: 'Copernicus Marine Service' },
  { value: 'roms', label: 'ROMS', description: 'Regional Ocean Modeling System' },
  { value: 'local_hydro', label: 'Local Hydrodynamic', description: 'Regional current model' },
] as const;

export const ACCURACY_LEVELS = [
  { value: 'fast', label: 'Fast', particles: 500, description: '~30s runtime' },
  { value: 'balanced', label: 'Balanced', particles: 2000, description: '~2min runtime' },
  { value: 'high', label: 'High', particles: 10000, description: '~8min runtime' },
] as const;

export const AI_MODELS = [
  { value: 'msar-v1', label: 'MSAR-Drift v1.0', description: 'Baseline trajectory model' },
  { value: 'msar-v2', label: 'MSAR-Drift v2.0', description: 'Improved ensemble predictions' },
  { value: 'opendrift-ai', label: 'OpenDrift-AI', description: 'AI-corrected OpenDrift output' },
  { value: 'ensemble', label: 'Ensemble (Recommended)', description: 'Multi-model consensus' },
] as const;
