/** Laptop-first layout tokens (optimized for 1366×768 – 1920×1080) */
export const LAPTOP_MIN_WIDTH = 1280;
export const CONTENT_MAX_WIDTH = 1440;
export const CONTENT_PADDING_X = 24;
export const CONTENT_PADDING_Y = 20;

/** Fixed panel heights for consistent laptop dashboard density */
export const MAP_PANEL_HEIGHT = 520;
export const MAP_PANEL_HEIGHT_COMPACT = 460;
export const SIDE_PANEL_WIDTH = 360;
export const WORKFLOW_STEPPER_HEIGHT = 56;

export const MISSION_WORKFLOW_STEPS = [
  { phase: 1, label: 'Mission', path: 'new' },
  { phase: 2, label: 'Location', path: 'location' },
  { phase: 3, label: 'Environment', path: 'environment' },
  { phase: 4, label: 'Simulation', path: 'simulation' },
  { phase: 5, label: 'Prediction', path: 'prediction' },
  { phase: 6, label: 'Search Area', path: 'search-area' },
  { phase: 7, label: 'Live Track', path: 'tracking' },
  { phase: 8, label: 'Decisions', path: 'decisions' },
] as const;

export const SIMULATION_DURATIONS = [6, 12, 24, 48, 72] as const;

export const DRIFT_MODELS = [
  { value: 'opendrift', label: 'OpenDrift', desc: 'Lagrangian particle tracking' },
  { value: 'leeway', label: 'Leeway Model', desc: 'Wind-driven object drift' },
  { value: 'hybrid', label: 'Hybrid ML', desc: 'OpenDrift + AI correction' },
] as const;

export const WEATHER_SOURCES = [
  { value: 'gfs', label: 'GFS (NOAA)', desc: 'Global Forecast System' },
  { value: 'ecmwf', label: 'ECMWF', desc: 'European Centre medium-range' },
  { value: 'icon', label: 'ICON (DWD)', desc: 'German weather service' },
] as const;

export const OCEAN_MODELS = [
  { value: 'hycom', label: 'HYCOM', desc: 'Hybrid Coordinate Ocean Model' },
  { value: 'cmems', label: 'CMEMS', desc: 'Copernicus Marine Service' },
  { value: 'rtofs', label: 'RTOFS', desc: 'Real-Time Ocean Forecast' },
] as const;

export const ACCURACY_LEVELS = [
  { value: 'fast', label: 'Fast', desc: '~2 min · 500 particles', particles: 500 },
  { value: 'balanced', label: 'Balanced', desc: '~8 min · 2000 particles', particles: 2000 },
  { value: 'high', label: 'High', desc: '~20 min · 5000 particles', particles: 5000 },
] as const;

export const AI_MODELS = [
  { value: 'lstm-drift', label: 'LSTM-Drift v2.1', desc: 'Recurrent neural drift correction' },
  { value: 'transformer-ocean', label: 'OceanTransformer', desc: 'Attention-based current model' },
  { value: 'ensemble-v2', label: 'Ensemble v2', desc: 'Multi-model weighted ensemble' },
] as const;

export const PARTICLE_COUNT_PRESETS = [500, 1000, 2000, 5000, 10000] as const;

export const laptopTwoColumn = {
  display: 'grid',
  gridTemplateColumns: '1fr 360px',
  gap: 2.5,
  alignItems: 'start',
} as const;

export const laptopMapColumn = {
  display: 'grid',
  gridTemplateColumns: '1fr 380px',
  gap: 2.5,
  alignItems: 'start',
} as const;
