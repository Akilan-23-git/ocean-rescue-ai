import { useState, useCallback, useEffect, type ChangeEvent } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Snackbar,
  Chip,
  Divider,
  alpha,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import StraightenIcon from '@mui/icons-material/Straighten';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { OceanMap } from './OceanMap';
import { useMission } from '@/features/mission/hooks/useMissions';
import { missionService } from '@/features/mission/services/missionService';
import { useMissionContext } from '@/context/MissionContext';
import type { Coordinates, MapLayerVisibility, ReferencePoint } from '@/types';
import { formatCoordinates, parseCoordinates, haversineDistance, generateId } from '@/utils';

const defaultLayers: MapLayerVisibility = {
  coastline: true,
  ports: true,
  shippingLanes: true,
  referencePoints: true,
};

export function IncidentLocationPanel() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { setCurrentMission } = useMissionContext();
  const { data: mission, refetch } = useMission(missionId);

  const [position, setPosition] = useState<Coordinates | null>(mission?.lastKnownPosition ?? null);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [referencePoints, setReferencePoints] = useState<ReferencePoint[]>(
    mission?.referencePoints ?? [],
  );
  const [layers, setLayers] = useState<MapLayerVisibility>(defaultLayers);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<Coordinates[]>([]);
  const [refLabel, setRefLabel] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    if (mission) {
      setPosition(mission.lastKnownPosition);
      setReferencePoints(mission.referencePoints);
      if (mission.lastKnownPosition) {
        setLatInput(mission.lastKnownPosition.lat.toFixed(6));
        setLngInput(mission.lastKnownPosition.lng.toFixed(6));
      }
    }
  }, [mission]);

  const updatePosition = useCallback((coords: Coordinates) => {
    setPosition(coords);
    setLatInput(coords.lat.toFixed(6));
    setLngInput(coords.lng.toFixed(6));
  }, []);

  const handleManualApply = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setSnackbar({ open: true, message: 'Invalid coordinates' });
      return;
    }
    updatePosition({ lat, lng });
  };

  const handleSearch = () => {
    const parsed = parseCoordinates(searchInput);
    if (parsed) {
      updatePosition(parsed);
    } else {
      setSnackbar({ open: true, message: 'Could not parse coordinates. Use format: lat, lng' });
    }
  };

  const handleAddReference = () => {
    if (!position) return;
    const point: ReferencePoint = {
      id: generateId(),
      label: refLabel || `Ref Point ${referencePoints.length + 1}`,
      lat: position.lat,
      lng: position.lng,
    };
    setReferencePoints((prev) => [...prev, point]);
    setRefLabel('');
  };

  const handleImportGps = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      const imported: ReferencePoint[] = [];
      lines.forEach((line, i) => {
        const parsed = parseCoordinates(line.trim());
        if (parsed) {
          imported.push({
            id: generateId(),
            label: `GPS Import ${i + 1}`,
            ...parsed,
          });
        }
      });
      if (imported.length > 0) {
        setReferencePoints((prev) => [...prev, ...imported]);
        if (!position) updatePosition(imported[0]);
        setSnackbar({ open: true, message: `Imported ${imported.length} coordinate(s)` });
      } else {
        setSnackbar({ open: true, message: 'No valid coordinates found in file' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const measureDistance =
    measurePoints.length >= 2
      ? haversineDistance(
          measurePoints[0].lat,
          measurePoints[0].lng,
          measurePoints[1].lat,
          measurePoints[1].lng,
        )
      : null;

  const handleSave = () => {
    if (!missionId || !position) {
      setSnackbar({ open: true, message: 'Please set a last known position' });
      return;
    }
    const updated = missionService.update(missionId, {
      lastKnownPosition: position,
      referencePoints,
    });
    if (updated) {
      setCurrentMission(updated);
      refetch();
      setSnackbar({ open: true, message: 'Location saved successfully' });
    }
  };

  if (!mission) {
    return (
      <Box>
        <Alert severity="warning">Mission not found. Please create a mission first.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/missions/new')}>
          Create Mission
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Incident Location"
        subtitle={`Set last known position for mission ${mission.missionId}`}
        badge={<PhaseIndicator currentPhase={2} totalPhases={13} label="Incident Location" />}
        action={<StatusChip status={mission.status} />}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <GlassCard sx={{ p: 0, overflow: 'hidden', height: { xs: 400, md: 560 } }}>
            <OceanMap
              position={position}
              referencePoints={referencePoints}
              layers={layers}
              measureMode={measureMode}
              measurePoints={measurePoints}
              onMapClick={updatePosition}
              onMarkerDrag={updatePosition}
              onMeasureClick={(coords) => {
                setMeasurePoints((prev) => (prev.length >= 2 ? [coords] : [...prev, coords]));
              }}
            />
          </GlassCard>

          {position && (
            <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<MyLocationIcon />}
                label={formatCoordinates(position.lat, position.lng)}
                color="primary"
                variant="outlined"
              />
              {measureDistance !== null && (
                <Chip
                  icon={<StraightenIcon />}
                  label={`Distance: ${measureDistance.toFixed(2)} km`}
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} lg={4}>
          <GlassCard sx={{ p: 2.5, mb: 2 }} delay={0.05}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Coordinates
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <TextField
                label="Latitude"
                size="small"
                fullWidth
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                placeholder="e.g. 18.9400"
              />
              <TextField
                label="Longitude"
                size="small"
                fullWidth
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                placeholder="e.g. 72.8400"
              />
            </Box>
            <Button variant="outlined" fullWidth onClick={handleManualApply} sx={{ mb: 1.5 }}>
              Apply Coordinates
            </Button>
            <TextField
              label="Search Coordinates"
              size="small"
              fullWidth
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="lat, lng"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="text" fullWidth onClick={handleSearch} sx={{ mt: 0.5 }}>
              Search
            </Button>
          </GlassCard>

          <GlassCard sx={{ p: 2.5, mb: 2 }} delay={0.1}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Map Layers
            </Typography>
            {(
              [
                ['coastline', 'Nearest Coastline (50km)'],
                ['ports', 'Nearby Ports'],
                ['shippingLanes', 'Shipping Lanes'],
                ['referencePoints', 'Reference Points'],
              ] as const
            ).map(([key, label]) => (
              <FormControlLabel
                key={key}
                control={
                  <Switch
                    checked={layers[key]}
                    onChange={(e) => setLayers((l) => ({ ...l, [key]: e.target.checked }))}
                    size="small"
                  />
                }
                label={<Typography variant="body2">{label}</Typography>}
                sx={{ display: 'flex', ml: 0 }}
              />
            ))}
            <Divider sx={{ my: 1.5 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={measureMode}
                  onChange={(e) => {
                    setMeasureMode(e.target.checked);
                    setMeasurePoints([]);
                  }}
                  size="small"
                  color="secondary"
                />
              }
              label={<Typography variant="body2">Distance Measurement Tool</Typography>}
              sx={{ display: 'flex', ml: 0 }}
            />
          </GlassCard>

          <GlassCard sx={{ p: 2.5, mb: 2 }} delay={0.15}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Reference Points
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label="Label"
                size="small"
                fullWidth
                value={refLabel}
                onChange={(e) => setRefLabel(e.target.value)}
              />
              <Button variant="outlined" onClick={handleAddReference} disabled={!position}>
                Add
              </Button>
            </Box>
            <Button
              component="label"
              variant="outlined"
              fullWidth
              startIcon={<UploadFileIcon />}
              sx={{ mb: 1.5 }}
            >
              Import GPS Coordinates
              <input type="file" accept=".csv,.txt,.gpx" hidden onChange={handleImportGps} />
            </Button>
            <List dense sx={{ maxHeight: 160, overflow: 'auto' }}>
              {referencePoints.map((point) => (
                <ListItem
                  key={point.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() =>
                        setReferencePoints((prev) => prev.filter((p) => p.id !== point.id))
                      }
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                  }}
                >
                  <ListItemText
                    primary={point.label}
                    secondary={formatCoordinates(point.lat, point.lng)}
                    primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
              ))}
              {referencePoints.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No reference points added
                </Typography>
              )}
            </List>
          </GlassCard>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!position}
            >
              Save Location
            </Button>
            <Button
              variant="contained"
              fullWidth
              endIcon={<ArrowForwardIcon />}
              onClick={handleSave}
              disabled={!position}
            >
              Continue
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
}
