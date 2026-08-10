import type { Mission } from '@/types';
import type { LiveTrackingState, RescueDecisionData, LiveConditions } from '@/types/tracking';
import type { TrajectoryPoint } from '@/types/simulation';
import { haversineDistance } from '@/utils';

function interpolatePosition(points: TrajectoryPoint[], hour: number) {
  const idx = Math.min(Math.floor(hour), points.length - 2);
  const t = hour - idx;
  const a = points[idx];
  const b = points[Math.min(idx + 1, points.length - 1)];
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

function mockConditions(seed: number): LiveConditions {
  const r = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return {
    windSpeed: Math.round((8 + r() * 18) * 10) / 10,
    windDirection: Math.round(r() * 360),
    currentSpeed: Math.round((0.3 + r() * 2) * 100) / 100,
    currentDirection: Math.round(r() * 360),
    updatedAt: new Date().toISOString(),
  };
}

export const liveTrackingService = {
  createInitialState(mission: Mission): LiveTrackingState | null {
    const path = mission.simulationResult?.primaryPath.points;
    if (!path?.length || !mission.lastKnownPosition) return null;

    const maxHour = path[path.length - 1].hour;
    const durationMs = maxHour * 3600000;

    return {
      status: 'idle',
      currentHour: 0,
      maxHour,
      currentPosition: { ...mission.lastKnownPosition },
      countdownEndsAt: new Date(Date.now() + durationMs).toISOString(),
      startedAt: null,
      pausedAt: null,
      conditions: mockConditions(42),
      autoRefresh: true,
    };
  },

  getPositionAtHour(mission: Mission, hour: number) {
    const points = mission.simulationResult?.primaryPath.points;
    if (!points) return mission.lastKnownPosition;
    return interpolatePosition(points, hour);
  },

  refreshConditions(state: LiveTrackingState): LiveConditions {
    return mockConditions(Date.now());
  },

  tick(state: LiveTrackingState, mission: Mission, deltaHours: number): LiveTrackingState {
    const newHour = Math.min(state.currentHour + deltaHours, state.maxHour);
    const position = this.getPositionAtHour(mission, newHour) ?? state.currentPosition;
    const completed = newHour >= state.maxHour;

    return {
      ...state,
      currentHour: newHour,
      currentPosition: position,
      status: completed ? 'completed' : state.status === 'replaying' ? 'replaying' : 'running',
      conditions: state.autoRefresh ? this.refreshConditions(state) : state.conditions,
    };
  },
};

const RESCUE_STATIONS = [
  { name: 'ICG Mumbai', type: 'coast_guard' as const, lat: 18.94, lng: 72.84 },
  { name: 'ICG Chennai', type: 'coast_guard' as const, lat: 13.1, lng: 80.3 },
  { name: 'ICG Kochi', type: 'naval' as const, lat: 9.97, lng: 76.27 },
  { name: 'ICG Visakhapatnam', type: 'coast_guard' as const, lat: 17.69, lng: 83.3 },
];

const PATROL_VESSELS = [
  { name: 'ICGS Samudra Prahari', callSign: 'CG-401', lat: 18.5, lng: 72.5, status: 'available' as const },
  { name: 'ICGS Varaha', callSign: 'CG-312', lat: 17.2, lng: 73.1, status: 'en_route' as const },
  { name: 'ICGS C-427', callSign: 'CG-427', lat: 19.1, lng: 71.8, status: 'available' as const },
];

export const rescueDecisionService = {
  generate(mission: Mission): RescueDecisionData | null {
    if (!mission.lastKnownPosition || !mission.searchArea || !mission.simulationResult) return null;

    const origin = mission.lastKnownPosition;
    const end = mission.simulationResult.primaryPath.points.at(-1)!;

    const searchZones = mission.searchArea.zones
      .map((z, i) => ({
        id: z.id,
        name: `${z.level.charAt(0).toUpperCase() + z.level.slice(1)} Probability Zone`,
        priority: z.searchOrder,
        probability: z.probability,
        estimatedSearchHours: Math.round((z.radiusKm * 0.4 + 1) * 10) / 10,
        lat: z.center.lat,
        lng: z.center.lng,
        radiusKm: z.radiusKm,
      }))
      .sort((a, b) => a.priority - b.priority);

    const stations = RESCUE_STATIONS.map((s) => {
      const distanceKm = haversineDistance(origin.lat, origin.lng, s.lat, s.lng);
      return {
        id: s.name,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        distanceKm: Math.round(distanceKm * 10) / 10,
        etaMinutes: Math.round((distanceKm / 25) * 60),
        type: s.type,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    const vessels = PATROL_VESSELS.map((v) => {
      const distanceKm = haversineDistance(end.lat, end.lng, v.lat, v.lng);
      return {
        id: v.callSign,
        name: v.name,
        callSign: v.callSign,
        lat: v.lat,
        lng: v.lng,
        distanceKm: Math.round(distanceKm * 10) / 10,
        etaMinutes: Math.round((distanceKm / 18) * 60),
        status: v.status,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    const closest = stations[0];
    const nearest = vessels[0];

    const route = [
      { lat: closest.lat, lng: closest.lng },
      { lat: (closest.lat + end.lat) / 2, lng: (closest.lng + end.lng) / 2 },
      { lat: end.lat, lng: end.lng },
    ];

    const totalHours = searchZones.reduce((s, z) => s + z.estimatedSearchHours, 0);

    return {
      generatedAt: new Date().toISOString(),
      searchZones,
      closestStation: closest,
      nearestVessel: nearest,
      recommendedRoute: route,
      searchExpansionKm: Math.round(mission.searchArea.searchRadiusKm * 1.25 * 10) / 10,
      totalEstimatedSearchHours: Math.round(totalHours * 10) / 10,
      riskAlerts: [
        {
          id: 'r1',
          level: 'warning',
          title: 'Deteriorating Visibility',
          message: 'Visibility forecast to drop below 5 km within 3 hours. Prioritize aerial search assets.',
        },
        {
          id: 'r2',
          level: 'critical',
          title: 'Nightfall Approaching',
          message: 'Sunset in ~2.5 hours. Deploy vessels to high-probability zone before dark.',
        },
      ],
      weatherWarnings: [
        {
          id: 'w1',
          level: 'warning',
          title: 'Wind Increase',
          message: 'Wind speeds expected to increase 15–20 kn. Adjust search pattern for drift expansion.',
        },
        {
          id: 'w2',
          level: 'info',
          title: 'Sea State 4',
          message: 'Moderate seas may reduce small craft search effectiveness.',
        },
      ],
      aiRecommendations: [
        `Deploy ${nearest.name} (${nearest.callSign}) to high-probability zone first — ETA ${nearest.etaMinutes} min.`,
        `Begin search at Zone #1 (${(searchZones[0]?.probability ?? 0.7) * 100}% probability) with expanding square pattern.`,
        `Coordinate with ${closest.name} for shore-based SAR support and helicopter staging.`,
        `If no contact within ${Math.round(totalHours / 2)}h, expand search radius to ${Math.round(mission.searchArea.searchRadiusKm * 1.25)} km.`,
        `Monitor drift vector ${mission.simulationResult.driftDirection}° — object likely moving ${mission.simulationResult.driftDistanceKm} km from LKP.`,
      ],
    };
  },
};
