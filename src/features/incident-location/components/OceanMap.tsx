import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMapEvents, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import type { Coordinates, ReferencePoint, MapLayerVisibility } from '@/types';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, SAMPLE_PORTS } from '@/constants';
import { incidentIcon, referenceIcon, portIcon } from './mapIcons';
import './oceanMap.css';

interface OceanMapProps {
  position: Coordinates | null;
  referencePoints: ReferencePoint[];
  layers: MapLayerVisibility;
  measureMode: boolean;
  measurePoints: Coordinates[];
  onMapClick: (coords: Coordinates) => void;
  onMarkerDrag: (coords: Coordinates) => void;
  onMeasureClick: (coords: Coordinates) => void;
  /** Reported GPS uncertainty in meters (accuracy circle). */
  gpsAccuracyMeters?: number | null;
}

function MapClickHandler({
  measureMode,
  onMapClick,
  onMeasureClick,
}: {
  measureMode: boolean;
  onMapClick: (coords: Coordinates) => void;
  onMeasureClick: (coords: Coordinates) => void;
}) {
  useMapEvents({
    click(e) {
      const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (measureMode) {
        onMeasureClick(coords);
      } else {
        onMapClick(coords);
      }
    },
  });
  return null;
}

function MapCenterUpdater({ center, zoom }: { center: Coordinates; zoom: number }) {
  const map = useMap();
  const prev = useRef<string>('');

  useEffect(() => {
    const key = `${center.lat},${center.lng},${zoom}`;
    if (prev.current !== key) {
      map.setView([center.lat, center.lng], zoom, { animate: true });
      prev.current = key;
    }
  }, [center, zoom, map]);

  return null;
}

const SHIPPING_LANES: LatLngExpression[][] = [
  [
    [18.9, 72.8],
    [15.0, 74.0],
    [12.0, 76.0],
    [9.0, 78.0],
    [6.0, 80.0],
  ],
  [
    [22.0, 88.0],
    [18.0, 84.0],
    [14.0, 80.0],
    [10.0, 76.0],
  ],
];

export function OceanMap({
  position,
  referencePoints,
  layers,
  measureMode,
  measurePoints,
  onMapClick,
  onMarkerDrag,
  onMeasureClick,
  gpsAccuracyMeters = null,
}: OceanMapProps) {
  const center = position ?? DEFAULT_MAP_CENTER;
  const zoom = position
    ? gpsAccuracyMeters != null && gpsAccuracyMeters > 0
      ? Math.max(12, Math.min(16, Math.round(16 - Math.log10(Math.max(gpsAccuracyMeters, 5)))))
      : 12
    : DEFAULT_MAP_ZOOM;

  const handleDragEnd = useCallback(
    (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
      const { lat, lng } = e.target.getLatLng();
      onMarkerDrag({ lat, lng });
    },
    [onMarkerDrag],
  );

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className="ocean-map"
      zoomControl={true}
      style={{ height: '100%', width: '100%', borderRadius: 12 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapCenterUpdater center={center} zoom={zoom} />
      <MapClickHandler
        measureMode={measureMode}
        onMapClick={onMapClick}
        onMeasureClick={onMeasureClick}
      />

      {position && (
        <Marker
          position={[position.lat, position.lng]}
          icon={incidentIcon}
          draggable={!measureMode}
          eventHandlers={{ dragend: handleDragEnd }}
        >
          <Popup>
            <strong>Emergency Position</strong>
            <br />
            {position.lat.toFixed(6)}°, {position.lng.toFixed(6)}°
            {gpsAccuracyMeters != null && (
              <>
                <br />
                GPS accuracy: ±{gpsAccuracyMeters.toFixed(0)} m (reported uncertainty)
              </>
            )}
          </Popup>
        </Marker>
      )}

      {position && gpsAccuracyMeters != null && gpsAccuracyMeters > 0 && (
        <Circle
          center={[position.lat, position.lng]}
          radius={gpsAccuracyMeters}
          pathOptions={{
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '4 6',
          }}
        />
      )}

      {layers.referencePoints &&
        referencePoints.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={referenceIcon}
          >
            <Popup>
              <strong>{point.label}</strong>
              <br />
              {point.lat.toFixed(4)}°, {point.lng.toFixed(4)}°
            </Popup>
          </Marker>
        ))}

      {layers.ports &&
        SAMPLE_PORTS.map((port) => (
          <Marker key={port.name} position={[port.lat, port.lng]} icon={portIcon}>
            <Popup>
              <strong>{port.name}</strong>
            </Popup>
          </Marker>
        ))}

      {layers.shippingLanes &&
        SHIPPING_LANES.map((lane, i) => (
          <Polyline
            key={`lane-${i}`}
            positions={lane}
            pathOptions={{ color: '#f59e0b', weight: 2, opacity: 0.6, dashArray: '8 8' }}
          />
        ))}

      {layers.coastline && position && (
        <Circle
          center={[position.lat, position.lng]}
          radius={50000}
          pathOptions={{ color: '#00d4ff', fillColor: '#00d4ff', fillOpacity: 0.05, weight: 1 }}
        />
      )}

      {measurePoints.length >= 2 && (
        <Polyline
          positions={measurePoints.map((p) => [p.lat, p.lng] as LatLngExpression)}
          pathOptions={{ color: '#00d4ff', weight: 3, dashArray: '6 6' }}
        />
      )}

      {measurePoints.map((p, i) => (
        <Circle
          key={`measure-${i}`}
          center={[p.lat, p.lng]}
          radius={500}
          pathOptions={{ color: '#00d4ff', fillColor: '#00d4ff', fillOpacity: 0.8 }}
        />
      ))}
    </MapContainer>
  );
}
