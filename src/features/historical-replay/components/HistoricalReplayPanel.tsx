import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Slider,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  alpha,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DownloadIcon from '@mui/icons-material/Download';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import { PredictionMap } from '@/components/map/PredictionMap';
import { useMission, useSaveReplaySnapshot } from '@/features/mission/hooks/useMissions';
import { missionService } from '@/features/mission/services/missionService';
import { replayService } from '@/features/analytics/services/analyticsService';
import { MAP_PANEL_HEIGHT, laptopMapColumn } from '@/constants/layout';
import { useQueryClient } from '@tanstack/react-query';
import { MISSIONS_KEY } from '@/features/mission/hooks/useMissions';

export function HistoricalReplayPanel() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: mission, refetch } = useMission(missionId);
  const saveSnapshot = useSaveReplaySnapshot();

  const [hour, setHour] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [learningMode, setLearningMode] = useState(false);
  const [showActual, setShowActual] = useState(true);
  const [showPredicted, setShowPredicted] = useState(true);

  useEffect(() => {
    if (missionId && mission?.simulationResult && !mission.actualPath?.length) {
      missionService.ensureReplayData(missionId);
      queryClient.invalidateQueries({ queryKey: MISSIONS_KEY });
      refetch();
    }
  }, [missionId, mission?.simulationResult, mission?.actualPath?.length]);

  const maxHour = mission?.simulationResult?.primaryPath.points.at(-1)?.hour ?? 24;
  const analysis = useMemo(() => (mission ? replayService.analyze(mission) : null), [mission]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setHour((h) => {
        if (h >= maxHour) {
          setPlaying(false);
          return maxHour;
        }
        return Math.min(maxHour, h + 0.5);
      });
    }, 400);
    return () => clearInterval(timer);
  }, [playing, maxHour]);

  if (!mission) {
    return (
      <LaptopContainer>
        <Alert severity="warning">Mission not found</Alert>
      </LaptopContainer>
    );
  }

  if (!mission.simulationResult) {
    return (
      <LaptopContainer>
        <GlassCard sx={{ p: 4, textAlign: 'center' }}>
          <Typography gutterBottom>No simulation available for replay.</Typography>
          <Button variant="contained" onClick={() => navigate(`/missions/${mission.id}/simulation`)}>
            Run Simulation
          </Button>
        </GlassCard>
      </LaptopContainer>
    );
  }

  const origin = mission.lastKnownPosition!;
  const predictedPoint = mission.simulationResult.primaryPath.points.find(
    (p) => p.hour === Math.floor(hour),
  );
  const actualPoint = mission.actualPath?.find((p) => p.hour === Math.floor(hour));

  const handleExport = () => {
    const json = replayService.exportReplayJson(mission, analysis);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mission.missionId}-replay.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSnapshot = () => {
    const snap = replayService.createSnapshot(mission, hour);
    if (!snap) return;
    saveSnapshot.mutate({ id: mission.id, snapshot: snap }, { onSuccess: () => refetch() });
  };

  return (
    <LaptopContainer>
      <PageHeader
        title="Historical Replay"
        subtitle={`Post-mission analysis — ${mission.missionId}`}
        badge={<PhaseIndicator currentPhase={10} totalPhases={13} label="Historical Replay" />}
        action={<StatusChip status={mission.status} />}
      />

      <Box sx={{ ...laptopMapColumn, minHeight: MAP_PANEL_HEIGHT, mb: 2.5 }}>
        <GlassCard sx={{ p: 0, overflow: 'hidden', height: MAP_PANEL_HEIGHT }}>
          <PredictionMap
            origin={origin}
            result={showPredicted ? mission.simulationResult : undefined}
            showPaths={showPredicted}
            showActualPath={showActual}
            actualPath={mission.actualPath}
            selectedHour={hour}
            livePosition={predictedPoint}
            height={MAP_PANEL_HEIGHT}
          />
        </GlassCard>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: MAP_PANEL_HEIGHT, overflowY: 'auto' }}>
          <GlassCard sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Playback Controls
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
              <Button
                variant="contained"
                startIcon={playing ? <PauseIcon /> : <PlayArrowIcon />}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={() => {
                  setHour(0);
                  setPlaying(true);
                }}
              >
                Restart
              </Button>
            </Box>
            <Slider
              value={hour}
              min={0}
              max={maxHour}
              step={0.5}
              onChange={(_, v) => {
                setPlaying(false);
                setHour(v as number);
              }}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `+${v}h`}
              marks={[
                { value: 0, label: '0h' },
                { value: Math.floor(maxHour / 2), label: `+${Math.floor(maxHour / 2)}h` },
                { value: maxHour, label: `+${maxHour}h` },
              ]}
            />
          </GlassCard>

          <GlassCard sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Compare Paths
            </Typography>
            <FormControlLabel
              control={<Switch checked={showPredicted} onChange={(e) => setShowPredicted(e.target.checked)} size="small" />}
              label={<Typography variant="body2">Predicted (cyan)</Typography>}
            />
            <FormControlLabel
              control={<Switch checked={showActual} onChange={(e) => setShowActual(e.target.checked)} size="small" />}
              label={<Typography variant="body2">Actual (amber)</Typography>}
            />
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Predicted: {predictedPoint ? `${predictedPoint.lat.toFixed(4)}, ${predictedPoint.lng.toFixed(4)}` : '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Actual: {actualPoint ? `${actualPoint.lat.toFixed(4)}, ${actualPoint.lng.toFixed(4)}` : '—'}
              </Typography>
            </Box>
          </GlassCard>

          <GlassCard sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Accuracy Analysis
            </Typography>
            {analysis ? (
              <>
                <Typography variant="h4" fontWeight={700} color="secondary.main">
                  {analysis.accuracyPercent}%
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Mean error {analysis.meanErrorKm} km · Max {analysis.maxErrorKm} km
                </Typography>
              </>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Actual path generating…
              </Typography>
            )}
          </GlassCard>

          <GlassCard sx={{ p: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <Button size="small" variant="outlined" startIcon={<CameraAltIcon />} onClick={handleSnapshot}>
                Snapshot
              </Button>
              <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
                Export
              </Button>
            </Box>
            <FormControlLabel
              sx={{ mt: 1 }}
              control={
                <Switch
                  checked={learningMode}
                  onChange={(e) => setLearningMode(e.target.checked)}
                  size="small"
                  color="secondary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SchoolIcon fontSize="small" />
                  <Typography variant="body2">Learning mode</Typography>
                </Box>
              }
            />
          </GlassCard>
        </Box>
      </Box>

      {learningMode && analysis && (
        <GlassCard sx={{ p: 3, mb: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Learning Mode — Error Over Time
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Study how prediction error evolves. Lower error early in the drift window usually indicates strong
            environmental forcing agreement.
          </Typography>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analysis.samples}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Hour', fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Error km', angle: -90, fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,0.2)' }} />
              <Line type="monotone" dataKey="errorKm" name="Error (km)" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {(mission.replaySnapshots ?? []).length > 0 && (
        <GlassCard sx={{ p: 2.5, mb: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Saved Snapshots
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(mission.replaySnapshots ?? []).map((s) => (
              <Chip
                key={s.id}
                label={`${s.label} · ${new Date(s.createdAt).toLocaleTimeString()}`}
                onClick={() => setHour(s.hour)}
                sx={{ bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1) }}
              />
            ))}
          </Box>
        </GlassCard>
      )}

      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/missions/active')}>
        Back to Mission Management
      </Button>
    </LaptopContainer>
  );
}
