import { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  Polygon,
  useMap,
} from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import type { Coordinates } from '@/types';
import type { SimulationResult, SearchAreaData } from '@/types/simulation';
import { incidentIcon, liveTrackIcon, vesselIcon } from '@/features/incident-location/components/mapIcons';
import '@/features/incident-location/components/oceanMap.css';

interface PredictionMapProps {
  origin: Coordinates;
  result?: SimulationResult;
  searchArea?: SearchAreaData;
  showHeatmap?: boolean;
  showGrid?: boolean;
  showEllipse?: boolean;
  showPaths?: boolean;
  selectedHour?: number;
  height?: number;
  livePosition?: Coordinates;
  rescueRoute?: Coordinates[];
  showVessels?: { lat: number; lng: number; label: string }[];
}

function MapController({
  center,
  zoom,
  followPosition,
}: {
  center: Coordinates;
  zoom: number;
  followPosition?: Coordinates;
}) {
  const map = useMap();
  const prev = useRef('');

  useEffect(() => {
    const target = followPosition ?? center;
    const key = `${target.lat.toFixed(4)},${target.lng.toFixed(4)}`;
    if (prev.current !== key) {
      map.setView([target.lat, target.lng], zoom, { animate: true });
      prev.current = key;
    }
  }, [center, zoom, followPosition, map]);

  return null;
}

function ellipsePoints(
  center: Coordinates,
  semiMajorKm: number,
  semiMinorKm: number,
  rotationDeg: number,
  steps = 64,
): LatLngExpression[] {
  const points: LatLngExpression[] = [];
  const rot = (rotationDeg * Math.PI) / 180;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    const x = semiMajorKm * Math.cos(t);
    const y = semiMinorKm * Math.sin(t);
    const xr = x * Math.cos(rot) - y * Math.sin(rot);
    const yr = x * Math.sin(rot) + y * Math.cos(rot);
    const lat = center.lat + (yr / 111.32);
    const lng = center.lng + (xr / (111.32 * Math.cos((center.lat * Math.PI) / 180)));
    points.push([lat, lng]);
  }
  return points;
}

const ZONE_COLORS = {
  high: { fill: '#ef4444', stroke: '#ef4444', opacity: 0.25 },
  medium: { fill: '#f59e0b', stroke: '#f59e0b', opacity: 0.18 },
  low: { fill: '#10b981', stroke: '#10b981', opacity: 0.12 },
};

export function PredictionMap({
  origin,
  result,
  searchArea,
  showHeatmap = false,
  showGrid = false,
  showEllipse = false,
  showPaths = true,
  selectedHour,
  height = 520,
  livePosition,
  rescueRoute,
  showVessels,
}: PredictionMapProps) {
  const center = result?.primaryPath.points.at(-1) ?? origin;
  const zoom = result ? 9 : 8;

  const trimPath = (points: { lat: number; lng: number }[]) => {
    if (selectedHour === undefined) return points.map((p) => [p.lat, p.lng] as LatLngExpression);
    return points
      .filter((p) => 'hour' in p && (p as { hour: number }).hour <= selectedHour)
      .map((p) => [p.lat, p.lng] as LatLngExpression);
  };

  return (
    <MapContainer
      center={[origin.lat, origin.lng]}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: 12 }}
      className="ocean-map"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} zoom={zoom} followPosition={livePosition} />

      <Marker position={[origin.lat, origin.lng]} icon={incidentIcon}>
        <Popup>Last Known Position</Popup>
      </Marker>

      {showHeatmap &&
        searchArea?.zones.map((zone) => {
          const c = ZONE_COLORS[zone.level];
          return (
            <Circle
              key={zone.id}
              center={[zone.center.lat, zone.center.lng]}
              radius={zone.radiusKm * 1000}
              pathOptions={{
                color: c.stroke,
                fillColor: c.fill,
                fillOpacity: c.opacity,
                weight: 2,
              }}
            />
          );
        })}

      {showEllipse && searchArea && (
        <Polygon
          positions={ellipsePoints(
            searchArea.ellipse.center,
            searchArea.ellipse.semiMajorKm,
            searchArea.ellipse.semiMinorKm,
            searchArea.ellipse.rotation,
          )}
          pathOptions={{
            color: '#00d4ff',
            fillColor: '#00d4ff',
            fillOpacity: 0.06,
            weight: 2,
            dashArray: '6 4',
          }}
        />
      )}

      {showGrid &&
        searchArea?.gridCells.map((cell) => (
          <Circle
            key={cell.id}
            center={[cell.center.lat, cell.center.lng]}
            radius={cell.sizeKm * 500}
            pathOptions={{
              color: `rgba(0, 212, 255, ${0.2 + cell.probability * 0.5})`,
              fillColor: '#00d4ff',
              fillOpacity: cell.probability * 0.35,
              weight: 1,
            }}
          >
            <Popup>
              Priority #{cell.priority} · {(cell.probability * 100).toFixed(0)}%
            </Popup>
          </Circle>
        ))}

      {livePosition && (
        <Marker position={[livePosition.lat, livePosition.lng]} icon={liveTrackIcon}>
          <Popup>Current Predicted Position</Popup>
        </Marker>
      )}

      {rescueRoute && rescueRoute.length > 1 && (
        <Polyline
          positions={rescueRoute.map((p) => [p.lat, p.lng] as LatLngExpression)}
          pathOptions={{ color: '#10b981', weight: 3, dashArray: '10 6', opacity: 0.85 }}
        />
      )}

      {showVessels?.map((v) => (
        <Marker key={v.label} position={[v.lat, v.lng]} icon={vesselIcon}>
          <Popup>{v.label}</Popup>
        </Marker>
      ))}

      {showPaths && result && (
        <>
          {result.alternatePaths.map((path, i) => (
            <Polyline
              key={path.id}
              positions={trimPath(path.points)}
              pathOptions={{
                color: '#6366f1',
                weight: 2,
                opacity: 0.35 + i * 0.05,
                dashArray: '4 6',
              }}
            />
          ))}
          <Polyline
            positions={trimPath(result.primaryPath.points)}
            pathOptions={{ color: '#00d4ff', weight: 4, opacity: 0.9 }}
          />
          {result.estimatedArrivals.map((arr) => (
            <Circle
              key={arr.label}
              center={[arr.lat, arr.lng]}
              radius={800}
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: arr.probability * 0.5,
                weight: 2,
              }}
            >
              <Popup>
                {arr.label} — {(arr.probability * 100).toFixed(0)}%
              </Popup>
            </Circle>
          ))}
        </>
      )}

      {searchArea && (
        <Circle
          center={[origin.lat, origin.lng]}
          radius={searchArea.searchRadiusKm * 1000}
          pathOptions={{
            color: 'rgba(148,163,184,0.4)',
            fillOpacity: 0,
            weight: 1,
            dashArray: '8 8',
          }}
        />
      )}
    </MapContainer>
  );
}