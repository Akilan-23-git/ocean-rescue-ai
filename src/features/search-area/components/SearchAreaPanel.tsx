import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import SearchIcon from '@mui/icons-material/Search';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import { MissionWorkflowStepper } from '@/components/layout/MissionWorkflowStepper';
import { PredictionMap } from '@/components/map/PredictionMap';
import { useMission } from '@/features/mission/hooks/useMissions';
import { MAP_PANEL_HEIGHT, laptopMapColumn } from '@/constants/layout';

const ZONE_LABELS = {
  high: { label: 'High Probability', color: '#ef4444' },
  medium: { label: 'Medium Probability', color: '#f59e0b' },
  low: { label: 'Low Probability', color: '#10b981' },
};

export function SearchAreaPanel() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { data: mission } = useMission(missionId);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showEllipse, setShowEllipse] = useState(true);
  const [showPaths, setShowPaths] = useState(false);
  const [zoomKey, setZoomKey] = useState(0);

  const origin = mission?.lastKnownPosition;
  const result = mission?.simulationResult;
  const searchArea = mission?.searchArea;

  if (!mission || !origin) return null;

  if (!searchArea || !result) {
    return (
      <LaptopContainer>
        <MissionWorkflowStepper currentPhase={6} />
        <GlassCard sx={{ p: 4, textAlign: 'center' }}>
          <Typography gutterBottom>Search area not generated. Run simulation first.</Typography>
          <Button variant="contained" onClick={() => navigate(`/missions/${missionId}/simulation`)}>
            Run Simulation
          </Button>
        </GlassCard>
      </LaptopContainer>
    );
  }

  const sortedZones = [...searchArea.zones].sort((a, b) => a.searchOrder - b.searchOrder);

  return (
    <LaptopContainer>
      <MissionWorkflowStepper currentPhase={6} />
      <PageHeader
        title="Probability Search Area"
        subtitle={`Search strategy for ${mission.missionId}`}
        badge={<PhaseIndicator currentPhase={6} totalPhases={13} label="Search Area" />}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <StatusChip status={mission.status} />
            <Button
              variant="outlined"
              size="small"
              startIcon={<ZoomInIcon />}
              onClick={() => setZoomKey((k) => k + 1)}
            >
              Zoom to Search Area
            </Button>
          </Box>
        }
      />

      <Box sx={{ ...laptopMapColumn, minHeight: MAP_PANEL_HEIGHT }}>
        <GlassCard sx={{ p: 0, overflow: 'hidden', height: MAP_PANEL_HEIGHT }}>
          <PredictionMap
            key={zoomKey}
            origin={origin}
            result={result}
            searchArea={searchArea}
            showHeatmap={showHeatmap}
            showGrid={showGrid}
            showEllipse={showEllipse}
            showPaths={showPaths}
            height={MAP_PANEL_HEIGHT}
          />
        </GlassCard>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: MAP_PANEL_HEIGHT, overflowY: 'auto' }}>
          <GlassCard sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Map Layers
            </Typography>
            <FormControlLabel control={<Switch checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} size="small" />} label="Probability Heatmap" />
            <FormControlLabel control={<Switch checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} size="small" />} label="Search Grid" />
            <FormControlLabel control={<Switch checked={showEllipse} onChange={(e) => setShowEllipse(e.target.checked)} size="small" />} label="Probability Ellipse" />
            <FormControlLabel control={<Switch checked={showPaths} onChange={(e) => setShowPaths(e.target.checked)} size="small" />} label="Drift Paths" />
          </GlassCard>

          <GlassCard sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Search Radius
            </Typography>
            <Typography variant="h4" fontWeight={700} color="secondary.main">
              {searchArea.searchRadiusKm.toFixed(1)} km
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total operational search envelope
            </Typography>
          </GlassCard>

          <GlassCard sx={{ p: 2, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <SearchIcon fontSize="small" color="secondary" />
              <Typography variant="subtitle2" fontWeight={600}>
                Recommended Search Order
              </Typography>
            </Box>
            <List dense disablePadding>
              {sortedZones.map((zone) => {
                const meta = ZONE_LABELS[zone.level];
                return (
                  <ListItem
                    key={zone.id}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.75,
                      bgcolor: alpha(meta.color, 0.08),
                      border: `1px solid ${alpha(meta.color, 0.25)}`,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={`#${zone.searchOrder}`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                          <Typography variant="body2" fontWeight={600}>{meta.label}</Typography>
                        </Box>
                      }
                      secondary={`${(zone.probability * 100).toFixed(0)}% probability · ${zone.radiusKm.toFixed(1)} km radius`}
                    />
                  </ListItem>
                );
              })}
            </List>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              TOP GRID CELLS
            </Typography>
            {searchArea.gridCells.slice(0, 5).map((cell) => (
              <Box key={cell.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography variant="caption">Cell P{cell.priority}</Typography>
                <Typography variant="caption" fontWeight={600}>{(cell.probability * 100).toFixed(0)}%</Typography>
              </Box>
            ))}
          </GlassCard>
        </Box>
      </Box>

      <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'space-between' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/missions/${missionId}/prediction`)}>
          Back to Prediction
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate(`/missions/${missionId}/tracking`)}
        >
          Continue to Live Tracking
        </Button>
      </Box>
    </LaptopContainer>
  );
}