import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Switch,
  FormControlLabel,
  alpha,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AirIcon from '@mui/icons-material/Air';
import WavesIcon from '@mui/icons-material/Waves';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import { MissionWorkflowStepper } from '@/components/layout/MissionWorkflowStepper';
import { PredictionMap } from '@/components/map/PredictionMap';
import { useMission } from '@/features/mission/hooks/useMissions';
import { useLiveTracking } from '../hooks/useLiveTracking';
import { environmentalService } from '@/features/environmental-data/services/environmentalService';
import { MAP_PANEL_HEIGHT, laptopMapColumn } from '@/constants/layout';
import { formatCoordinates } from '@/utils';

function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const STATUS_COLORS = {
  idle: 'default',
  running: 'success',
  paused: 'warning',
  completed: 'info',
  replaying: 'secondary',
} as const;

export function LiveTrackingPanel() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { data: mission } = useMission(missionId);
  const { tracking, remainingMs, start, pause, resume, replay, toggleAutoRefresh, isActive } =
    useLiveTracking(mission);
  const [countdown, setCountdown] = useState(remainingMs);

  useEffect(() => {
    const timer = setInterval(() => {
      if (tracking?.countdownEndsAt) {
        setCountdown(
          Math.max(0, new Date(tracking.countdownEndsAt).getTime() - Date.now()),
        );
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [tracking?.countdownEndsAt]);

  if (!mission?.lastKnownPosition || !mission.simulationResult) {
    return (
      <LaptopContainer>
        <GlassCard sx={{ p: 4, textAlign: 'center' }}>
          <Typography gutterBottom>Run simulation first to enable live tracking.</Typography>
          <Button variant="contained" onClick={() => navigate(`/missions/${missionId}/simulation`)}>
            Go to Simulation
          </Button>
        </GlassCard>
      </LaptopContainer>
    );
  }

  if (!tracking) return null;

  const progressPct = (tracking.currentHour / tracking.maxHour) * 100;
  const { conditions } = tracking;

  return (
    <LaptopContainer>
      <MissionWorkflowStepper currentPhase={7} />
      <PageHeader
        title="Live Tracking"
        subtitle={`Real-time drift monitoring — ${mission.missionId}`}
        badge={<PhaseIndicator currentPhase={7} totalPhases={13} label="Live Tracking" />}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important' }} />}
              label={tracking.status.toUpperCase()}
              color={STATUS_COLORS[tracking.status]}
              size="small"
            />
            <StatusChip status={mission.status} />
          </Box>
        }
      />

      <Box sx={{ ...laptopMapColumn, minHeight: MAP_PANEL_HEIGHT }}>
        <GlassCard sx={{ p: 0, overflow: 'hidden', height: MAP_PANEL_HEIGHT }}>
          <PredictionMap
            origin={mission.lastKnownPosition}
            result={mission.simulationResult}
            searchArea={mission.searchArea}
            showHeatmap
            showPaths
            selectedHour={tracking.currentHour}
            livePosition={tracking.currentPosition}
            height={MAP_PANEL_HEIGHT}
          />
        </GlassCard>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: MAP_PANEL_HEIGHT, overflowY: 'auto' }}>
          <GlassCard sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              COUNTDOWN
            </Typography>
            <Typography variant="h4" fontWeight={700} fontFamily="monospace" color="secondary.main">
              {formatCountdown(countdown)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressPct}
              sx={{ mt: 1.5, height: 8, borderRadius: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Hour {tracking.currentHour.toFixed(1)} / {tracking.maxHour}h · {progressPct.toFixed(0)}% elapsed
            </Typography>
          </GlassCard>

          <GlassCard sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Current Predicted Location
            </Typography>
            <Typography variant="body2" fontWeight={700} fontFamily="monospace">
              {formatCoordinates(tracking.currentPosition.lat, tracking.currentPosition.lng)}
            </Typography>
          </GlassCard>

          <GlassCard sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Live Conditions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1, p: 1.5, borderRadius: 1.5, bgcolor: alpha('#00d4ff', 0.08) }}>
                <AirIcon sx={{ fontSize: 18, color: '#00d4ff', mb: 0.5 }} />
                <Typography variant="caption" color="text.secondary">Wind</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {conditions.windSpeed} kn · {conditions.windDirection}°
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {environmentalService.getCompassLabel(conditions.windDirection)}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, p: 1.5, borderRadius: 1.5, bgcolor: alpha('#1e6fd9', 0.08) }}>
                <WavesIcon sx={{ fontSize: 18, color: '#1e6fd9', mb: 0.5 }} />
                <Typography variant="caption" color="text.secondary">Current</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {conditions.currentSpeed} kn · {conditions.currentDirection}°
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Updated {new Date(conditions.updatedAt).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={tracking.autoRefresh}
                  onChange={toggleAutoRefresh}
                  size="small"
                />
              }
              label={<Typography variant="caption">Auto-refresh conditions</Typography>}
              sx={{ mt: 1, ml: 0 }}
            />
          </GlassCard>

          <GlassCard sx={{ p: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {tracking.status === 'idle' || tracking.status === 'completed' ? (
                <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={start} fullWidth>
                  Start
                </Button>
              ) : tracking.status === 'paused' ? (
                <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={resume} fullWidth>
                  Resume
                </Button>
              ) : (
                <Button variant="outlined" startIcon={<PauseIcon />} onClick={pause} fullWidth>
                  Pause
                </Button>
              )}
              <Button variant="outlined" startIcon={<ReplayIcon />} onClick={replay} fullWidth>
                Replay
              </Button>
            </Box>
          </GlassCard>
        </Box>
      </Box>

      <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'space-between' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/missions/${missionId}/search-area`)}>
          Back to Search Area
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate(`/missions/${missionId}/decisions`)}
          disabled={!isActive && tracking.status !== 'completed'}
        >
          Rescue Decision Support
        </Button>
      </Box>
    </LaptopContainer>
  );
}
