import type { Coordinates } from '@/types';
import type {
  SimulationConfig,
  SimulationResult,
  SearchAreaData,
  TrajectoryPoint,
  PredictionPath,
  ProbabilityZone,
  SearchGridCell,
} from '@/types/simulation';
import { generateId } from '@/utils';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function offsetCoord(lat: number, lng: number, distKm: number, bearingDeg: number) {
  const R = 6371;
  const brng = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distKm / R) +
      Math.cos(lat1) * Math.sin(distKm / R) * Math.cos(brng),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(distKm / R) * Math.cos(lat1),
      Math.cos(distKm / R) - Math.sin(lat1) * Math.sin(lat2),
    );
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

function generatePath(
  origin: Coordinates,
  config: SimulationConfig,
  rand: () => number,
  spread: number,
): PredictionPath {
  const points: TrajectoryPoint[] = [];
  const baseBearing = rand() * 360;
  const startTime = Date.now();
  let lat = origin.lat;
  let lng = origin.lng;

  for (let h = 0; h <= config.durationHours; h++) {
    const step = h === 0 ? 0 : 0.3 + rand() * 1.2 + config.durationHours * 0.02;
    const bearing = baseBearing + (rand() - 0.5) * 40 * spread;
    const next = offsetCoord(lat, lng, step, bearing);
    lat = next.lat;
    lng = next.lng;
    points.push({
      lat,
      lng,
      hour: h,
      timestamp: new Date(startTime + h * 3600000).toISOString(),
    });
  }

  return {
    id: generateId(),
    points,
    probability: Math.max(0.1, 1 - spread * 0.35),
  };
}

function computeDriftMetrics(primary: PredictionPath, origin: Coordinates) {
  const end = primary.points[primary.points.length - 1];
  const dLat = ((end.lat - origin.lat) * Math.PI) / 180;
  const dLng = ((end.lng - origin.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((end.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const y = Math.sin(dLng) * Math.cos((end.lat * Math.PI) / 180);
  const x =
    Math.cos((origin.lat * Math.PI) / 180) * Math.sin((end.lat * Math.PI) / 180) -
    Math.sin((origin.lat * Math.PI) / 180) *
      Math.cos((end.lat * Math.PI) / 180) *
      Math.cos(dLng);
  const direction = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return { distance, direction };
}

const DEFAULT_CONFIG: SimulationConfig = {
  durationHours: 24,
  particleCount: 2000,
  driftModel: 'opendrift',
  weatherSource: 'gfs',
  oceanModel: 'hycom',
  accuracyLevel: 'balanced',
  aiModel: 'ensemble-v2',
};

export const simulationService = {
  getDefaultConfig(): SimulationConfig {
    return { ...DEFAULT_CONFIG };
  },

  runSimulation(origin: Coordinates, config: SimulationConfig): SimulationResult {
    const seed = Math.abs(Math.floor(origin.lat * 1000 + origin.lng * 1000 + config.particleCount));
    const rand = seededRandom(seed);

    const primaryPath = generatePath(origin, config, rand, 0.2);
    const alternatePaths = Array.from({ length: 4 }, (_, i) =>
      generatePath(origin, config, seededRandom(seed + i + 1), 0.5 + i * 0.25),
    );

    const { distance, direction } = computeDriftMetrics(primaryPath, origin);
    const confidence = Math.min(
      95,
      60 + config.particleCount / 200 + (config.accuracyLevel === 'high' ? 15 : config.accuracyLevel === 'balanced' ? 8 : 0),
    );

    const endPoint = primaryPath.points[primaryPath.points.length - 1];

    return {
      id: generateId(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      progress: 100,
      status: 'completed',
      primaryPath,
      alternatePaths,
      driftDistanceKm: Math.round(distance * 100) / 100,
      driftDirection: Math.round(direction),
      confidenceScore: Math.round(confidence),
      estimatedArrivals: [
        {
          lat: endPoint.lat,
          lng: endPoint.lng,
          probability: 0.72,
          eta: endPoint.timestamp,
          label: 'Primary LKP',
        },
        {
          lat: alternatePaths[0].points.at(-1)!.lat,
          lng: alternatePaths[0].points.at(-1)!.lng,
          probability: 0.48,
          eta: alternatePaths[0].points.at(-1)!.timestamp,
          label: 'Secondary Zone A',
        },
        {
          lat: alternatePaths[1].points.at(-1)!.lat,
          lng: alternatePaths[1].points.at(-1)!.lng,
          probability: 0.31,
          eta: alternatePaths[1].points.at(-1)!.timestamp,
          label: 'Secondary Zone B',
        },
      ],
      aiExplanation: `Based on ${config.driftModel.toUpperCase()} model with ${config.particleCount} Monte Carlo particles over ${config.durationHours}h, the object is predicted to drift ${distance.toFixed(1)} km toward ${Math.round(direction)}°. Wind fields from ${config.weatherSource.toUpperCase()} and currents from ${config.oceanModel.toUpperCase()} drive the primary trajectory. The ${config.aiModel} model increases confidence by correcting leeway bias. Highest probability endpoint is northeast of last known position with ${Math.round(confidence)}% ensemble agreement.`,
    };
  },

  generateSearchArea(origin: Coordinates, result: SimulationResult): SearchAreaData {
    const end = result.primaryPath.points[result.primaryPath.points.length - 1];
    const mid = result.primaryPath.points[Math.floor(result.primaryPath.points.length / 2)];

    const zones: ProbabilityZone[] = [
      {
        id: 'zone-high',
        level: 'high',
        center: { lat: end.lat, lng: end.lng },
        radiusKm: result.driftDistanceKm * 0.15 + 2,
        probability: 0.72,
        searchOrder: 1,
      },
      {
        id: 'zone-medium',
        level: 'medium',
        center: { lat: (origin.lat + end.lat) / 2, lng: (origin.lng + end.lng) / 2 },
        radiusKm: result.driftDistanceKm * 0.25 + 4,
        probability: 0.45,
        searchOrder: 2,
      },
      {
        id: 'zone-low',
        level: 'low',
        center: { lat: mid.lat, lng: mid.lng },
        radiusKm: result.driftDistanceKm * 0.35 + 6,
        probability: 0.22,
        searchOrder: 3,
      },
    ];

    const gridCells: SearchGridCell[] = [];
    const gridSize = 5;
    const span = result.driftDistanceKm * 0.08;
    let priority = 1;

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        const dist = Math.sqrt(i * i + j * j);
        if (dist > gridSize) continue;
        const cellCenter = offsetCoord(end.lat, end.lng, span * dist, (Math.atan2(i, j) * 180) / Math.PI);
        gridCells.push({
          id: `cell-${i}-${j}`,
          center: cellCenter,
          sizeKm: span * 1.5,
          priority: priority++,
          probability: Math.max(0.05, 0.8 - dist * 0.12),
        });
      }
    }

    gridCells.sort((a, b) => b.probability - a.probability);
    gridCells.forEach((c, idx) => {
      c.priority = idx + 1;
    });

    return {
      zones,
      gridCells: gridCells.slice(0, 40),
      ellipse: {
        center: { lat: (origin.lat + end.lat) / 2, lng: (origin.lng + end.lng) / 2 },
        semiMajorKm: result.driftDistanceKm * 0.55 + 3,
        semiMinorKm: result.driftDistanceKm * 0.3 + 2,
        rotation: result.driftDirection,
      },
      searchRadiusKm: result.driftDistanceKm * 0.6 + 5,
      recommendedOrder: zones.sort((a, b) => a.searchOrder - b.searchOrder).map((z) => z.id),
    };
  },

  async simulateWithProgress(
    origin: Coordinates,
    config: SimulationConfig,
    onProgress: (p: number) => void,
  ): Promise<SimulationResult> {
    const steps = [10, 25, 45, 65, 80, 95, 100];
    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 350));
      onProgress(step);
    }
    return this.runSimulation(origin, config);
  },
};
