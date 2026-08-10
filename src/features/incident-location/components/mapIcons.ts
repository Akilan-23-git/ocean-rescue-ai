import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export const incidentIcon = L.divIcon({
  className: 'incident-marker',
  html: '<span class="incident-dot"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export const referenceIcon = L.divIcon({
  className: 'reference-marker',
  html: '<span class="reference-dot"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export const portIcon = L.divIcon({
  className: 'port-marker',
  html: '<span class="port-dot"></span>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

export const liveTrackIcon = L.divIcon({
  className: 'live-track-marker',
  html: '<span class="live-track-dot"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export const vesselIcon = L.divIcon({
  className: 'vessel-marker',
  html: '<span class="vessel-dot"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
