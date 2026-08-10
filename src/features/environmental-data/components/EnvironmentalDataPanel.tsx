import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Button,
  Alert,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  alpha,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import { MissionWorkflowStepper } from '@/components/layout/MissionWorkflowStepper';
import { useMission } from '@/features/mission/hooks/useMissions';
import { useEnvironmentalData } from '../hooks/useEnvironmentalData';
import { CurrentConditionsGrid } from './CurrentConditionsGrid';
import { ForecastChart } from './ForecastChart';
import { EnvironmentalTimeline } from './EnvironmentalTimeline';
import { formatCoordinates } from '@/utils';

export function EnvironmentalDataPanel() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { data: mission } = useMission(missionId);

  const position = mission?.lastKnownPosition;
  const { data: envData, isLoading, isFetching, refetch, error } = useEnvironmentalData(
    position
      ? { lat: position.lat, lng: position.lng, incidentTime: mission?.incidentDateTime }
      : null,
  );

  if (!mission) {
    return (
      <Box>
        <Alert severity="warning">Mission not found.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/missions/new')}>
          Create Mission
        </Button>
      </Box>
    );
  }

  if (!position) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No incident location set. Please set the last known position first.
        </Alert>
        <Button variant="contained" onClick={() => navigate(`/missions/${missionId}/location`)}>
          Go to Incident Location
        </Button>
      </Box>
    );
  }

  return (
    <LaptopContainer>
      <MissionWorkflowStepper currentPhase={3} />
      <PageHeader
        title="Environmental Data"
        subtitle={`Sea conditions affecting drift for ${mission.missionId}`}
        badge={<PhaseIndicator currentPhase={3} totalPhases={13} label="Environmental Data" />}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatusChip status={mission.status} />
            <Tooltip title="Refresh data">
              <IconButton onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      <GlassCard sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <LocationOnIcon color="secondary" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            {mission.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Position: {formatCoordinates(position.lat, position.lng)}
            {envData && ` · Last updated: ${new Date(envData.fetchedAt).toLocaleTimeString()}`}
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/missions/${missionId}/location`)}
        >
          Location
        </Button>
      </GlassCard>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load environmental data. Using simulated forecast data.
        </Alert>
      )}

      <GlassCard sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Current Conditions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Real-time and near-real-time environmental parameters at incident location
        </Typography>
        <CurrentConditionsGrid data={envData?.current} loading={isLoading} />
      </GlassCard>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, mb: 3 }}>
        <GlassCard sx={{ p: 3 }} delay={0.05}>
            {envData ? (
              <ForecastChart data={envData.weatherForecast} title="Weather Forecast" type="weather" />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            )}
          </GlassCard>
        <GlassCard sx={{ p: 3 }} delay={0.1}>
            {envData ? (
              <ForecastChart data={envData.currentForecast} title="Current Forecast" type="current" />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            )}
          </GlassCard>
      </Box>

      <GlassCard sx={{ p: 3, mb: 3 }} delay={0.15}>
        {envData ? (
          <EnvironmentalTimeline data={envData.timeline} />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </GlassCard>

      {envData && (
        <GlassCard sx={{ p: 2.5, mb: 3 }} delay={0.2}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Tide Schedule
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Next High Tide
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {new Date(envData.current.tide.nextHigh).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Next Low Tide
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {new Date(envData.current.tide.nextLow).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </GlassCard>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/missions/${missionId}/location`)}>
          Back to Location
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate(`/missions/${missionId}/simulation`)}
        >
          Continue to Simulation Setup
        </Button>
      </Box>
    </LaptopContainer>
  );
}
