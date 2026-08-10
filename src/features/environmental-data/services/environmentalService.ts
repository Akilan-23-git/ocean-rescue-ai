import type {
  EnvironmentalData,
  EnvironmentalRequest,
  ForecastPoint,
  EnvironmentalSnapshot,
} from '../types';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function seedFromCoords(lat: number, lng: number): number {
  return Math.abs(Math.floor(lat * 1000 + lng * 1000));
}

function compassLabel(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
}

function generateForecast(
  base: EnvironmentalSnapshot,
  hours: number,
  rand: () => number,
): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const now = new Date();

  for (let i = 0; i < hours; i++) {
    const t = new Date(now.getTime() + i * 3600000);
    const drift = () => (rand() - 0.5) * 2;
    points.push({
      timestamp: t.toISOString(),
      windSpeed: Math.max(0, base.wind.speed + drift() * 4),
      windDirection: (base.wind.direction + drift() * 20 + 360) % 360,
      currentSpeed: Math.max(0, base.oceanCurrent.speed + drift() * 0.5),
      currentDirection: (base.oceanCurrent.direction + drift() * 15 + 360) % 360,
      waveHeight: Math.max(0.1, base.waves.height + drift() * 0.4),
      temperature: base.seaTemperature + drift() * 0.5,
      visibility: Math.max(0.5, base.visibility.distance + drift() * 2),
    });
  }
  return points;
}

function buildSnapshot(lat: number, _lng: number, rand: () => number): EnvironmentalSnapshot {
  const windDir = rand() * 360;
  const currentDir = (windDir + 30 + rand() * 40) % 360;
  const waveHeight = 0.5 + rand() * 3.5;
  const visibilityKm = 2 + rand() * 18;
  const tideLevel = 0.5 + rand() * 3;

  const visibilityCondition =
    visibilityKm > 15
      ? 'excellent'
      : visibilityKm > 10
        ? 'good'
        : visibilityKm > 5
          ? 'moderate'
          : visibilityKm > 2
            ? 'poor'
            : 'very_poor';

  const tideStates: Array<'rising' | 'falling' | 'high' | 'low'> = [
    'rising',
    'falling',
    'high',
    'low',
  ];

  return {
    timestamp: new Date().toISOString(),
    wind: {
      speed: Math.round((5 + rand() * 25) * 10) / 10,
      direction: Math.round(windDir),
      gust: Math.round((8 + rand() * 30) * 10) / 10,
      unit: 'knots',
    },
    oceanCurrent: {
      speed: Math.round((0.2 + rand() * 2.5) * 100) / 100,
      direction: Math.round(currentDir),
      unit: 'knots',
    },
    waves: {
      height: Math.round(waveHeight * 100) / 100,
      period: Math.round((5 + rand() * 8) * 10) / 10,
      direction: Math.round((windDir + rand() * 20) % 360),
      unit: 'm',
    },
    seaTemperature: Math.round((18 + rand() * 12 + (lat > 0 ? -5 : 0)) * 10) / 10,
    tide: {
      level: Math.round(tideLevel * 100) / 100,
      state: tideStates[Math.floor(rand() * 4)],
      nextHigh: new Date(Date.now() + rand() * 6 * 3600000).toISOString(),
      nextLow: new Date(Date.now() + (3 + rand() * 6) * 3600000).toISOString(),
      unit: 'm',
    },
    visibility: {
      distance: Math.round(visibilityKm * 10) / 10,
      condition: visibilityCondition,
      unit: 'km',
    },
  };
}

export const environmentalService = {
  async fetchEnvironmentalData(req: EnvironmentalRequest): Promise<EnvironmentalData> {
    await new Promise((r) => setTimeout(r, 600));

    const rand = seededRandom(seedFromCoords(req.lat, req.lng));
    const current = buildSnapshot(req.lat, req.lng, rand);
    const weatherForecast = generateForecast(current, 72, rand);
    const currentForecast = generateForecast(current, 48, rand);

    return {
      location: { lat: req.lat, lng: req.lng },
      fetchedAt: new Date().toISOString(),
      current,
      weatherForecast,
      currentForecast,
      timeline: weatherForecast,
    };
  },

  getCompassLabel: compassLabel,
};
