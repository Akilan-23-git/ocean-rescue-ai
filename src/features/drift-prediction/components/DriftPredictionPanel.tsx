import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Slider,
  Chip,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ExploreIcon from '@mui/icons-material/Explore';
import StraightenIcon from '@mui/icons-material/Straighten';
import VerifiedIcon from '@mui/icons-material/Verified';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import { MissionWorkflowStepper } from '@/components/layout/MissionWorkflowStepper';
import { PredictionMap } from '@/components/map/PredictionMap';
import { useMission } from '@/features/mission/hooks/useMissions';
import { environmentalService } from '@/features/environmental-data/services/environmentalService';
import { MAP_PANEL_HEIGHT, laptopMapColumn } from '@/constants/layout';

export function DriftPredictionPanel() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { data: mission } = useMission(missionId);
  const [selectedHour, setSelectedHour] = useState<number | undefined>(undefined);

  const result = mission?.simulationResult;
  const origin = mission?.lastKnownPosition;
  const maxHour = result?.primaryPath.points.at(-1)?.hour ?? 24;

  if (!mission || !origin) {
    return null;
  }

  if (!result) {
    return (
      <LaptopContainer>
        <MissionWorkflowStepper currentPhase={5} />
        <GlassCard sx={{ p: 4, textAlign: 'center' }}>
          <Typography gutterBottom>No simulation results yet.</Typography>
          <Button variant="contained" onClick={() => navigate(`/missions/${missionId}/simulation`)}>
            Run Simulation
          </Button>
        </GlassCard>
      </LaptopContainer>
    );
  }

  return (
    <LaptopContainer>
      <MissionWorkflowStepper currentPhase={5} />
      <PageHeader
        title="Drift Prediction"
        subtitle={`Trajectory analysis for ${mission.missionId}`}
        badge={<PhaseIndicator currentPhase={5} totalPhases={13} label="Drift Prediction" />}
        action={<StatusChip status={mission.status} />}
      />

      <Box sx={{ ...laptopMapColumn, minHeight: MAP_PANEL_HEIGHT }}>
        <GlassCard sx={{ p: 0, overflow: 'hidden', height: MAP_PANEL_HEIGHT }}>
          <PredictionMap
            origin={origin}
            result={result}
            showPaths
            selectedHour={selectedHour}
            height={MAP_PANEL_HEIGHT}
          />
        </GlassCard>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: MAP_PANEL_HEIGHT, overflowY: 'auto' }}>
          <GlassCard sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={result.progress}
                sx={{ flex: 1, height: 6, borderRadius: 1 }}
                color="success"
              />
              <Chip label={`${result.progress}%`} size="small" color="success" />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Simulation {result.status} · {result.alternatePaths.length + 1} paths computed
            </Typography>
          </GlassCard>

          <GlassCard sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Key Metrics
            </Typography>
            {[
              { icon: <StraightenIcon fontSize="small" />, label: 'Drift Distance', value: `${result.driftDistanceKm} km` },
              { icon: <ExploreIcon fontSize="small" />, label: 'Drift Direction', value: `${result.driftDirection}° ${environmentalService.getCompassLabel(result.driftDirection)}` },
              { icon: <VerifiedIcon fontSize="small" />, label: 'Confidence', value: `${result.confidenceScore}%` },
            ].map((m) => (
              <Box key={m.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ color: 'secondary.main' }}>{m.icon}</Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{m.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{m.value}</Typography>
                </Box>
              </Box>
            ))}
          </GlassCard>

          <GlassCard sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Time-Based Prediction
            </Typography>
            <Slider
              value={selectedHour ?? maxHour}
              min={0}
              max={maxHour}
              onChange={(_, v) => setSelectedHour(v as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `+${v}h`}
              marks={[
                { value: 0, label: '0h' },
                { value: Math.floor(maxHour / 2), label: `+${Math.floor(maxHour / 2)}h` },
                { value: maxHour, label: `+${maxHour}h` },
              ]}
            />
          </GlassCard>

          <GlassCard sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Estimated Arrivals
            </Typography>
            {result.estimatedArrivals.map((arr) => (
              <Box key={arr.label} sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight={600}>{arr.label}</Typography>
                  <Chip label={`${(arr.probability * 100).toFixed(0)}%`} size="small" color="primary" />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {arr.lat.toFixed(3)}°, {arr.lng.toFixed(3)}°
                </Typography>
              </Box>
            ))}
          </GlassCard>
        </Box>
      </Box>

      <GlassCard sx={{ p: 2.5, mt: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <PsychologyIcon sx={{ color: 'secondary.main', mt: 0.25 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              AI Explanation
            </Typography>
            <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
              {result.aiExplanation}
            </Typography>
          </Box>
        </Box>
      </GlassCard>

      <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'space-between' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/missions/${missionId}/simulation`)}>
          Back to Setup
        </Button>
        <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => navigate(`/missions/${missionId}/search-area`)}>
          View Search Area
        </Button>
      </Box>
    </LaptopContainer>
  );
}
