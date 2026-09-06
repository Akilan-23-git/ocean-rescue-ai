import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RouteIcon from '@mui/icons-material/Route';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import { MissionWorkflowStepper } from '@/components/layout/MissionWorkflowStepper';
import { PredictionMap } from '@/components/map/PredictionMap';
import { useMission } from '@/features/mission/hooks/useMissions';
import { missionService } from '@/features/mission/services/missionService';
import { rescueDecisionService } from '@/features/live-tracking/services/trackingService';
import { MAP_PANEL_HEIGHT, laptopMapColumn } from '@/constants/layout';

const ALERT_COLORS = {
  critical: '#ef4444',
  warning: '#f59e0b',
  info: '#00d4ff',
};

export function RescueDecisionPanel() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { data: mission, refetch } = useMission(missionId);

  const decision = useMemo(() => {
    if (mission?.rescueDecision) return mission.rescueDecision;
    if (mission) return rescueDecisionService.generate(mission);
    return null;
  }, [mission]);

  useEffect(() => {
    if (mission && decision && !mission.rescueDecision) {
      missionService.update(mission.id, { rescueDecision: decision });
      refetch();
    }
  }, [mission?.id, decision]);

  if (!mission?.lastKnownPosition || !mission.simulationResult) {
    return (
      <LaptopContainer>
        <GlassCard sx={{ p: 4, textAlign: 'center' }}>
          <Typography gutterBottom>Complete simulation workflow first.</Typography>
          <Button variant="contained" onClick={() => navigate(`/missions/${missionId}/simulation`)}>
            Go to Simulation
          </Button>
        </GlassCard>
      </LaptopContainer>
    );
  }

  if (!decision) return null;

  const vessels = [
    {
      lat: decision.nearestVessel.lat,
      lng: decision.nearestVessel.lng,
      label: `${decision.nearestVessel.name} (${decision.nearestVessel.callSign})`,
    },
    {
      lat: decision.closestStation.lat,
      lng: decision.closestStation.lng,
      label: decision.closestStation.name,
    },
  ];

  return (
    <LaptopContainer>
      <MissionWorkflowStepper currentPhase={8} />
      <PageHeader
        title="Rescue Decision Support"
        subtitle={`Actionable guidance for ${mission.missionId}`}
        badge={<PhaseIndicator currentPhase={8} totalPhases={13} label="Decision Support" />}
        action={<StatusChip status={mission.status} />}
      />

      <Box sx={{ ...laptopMapColumn, minHeight: MAP_PANEL_HEIGHT, mb: 2.5 }}>
        <GlassCard sx={{ p: 0, overflow: 'hidden', height: MAP_PANEL_HEIGHT }}>
          <PredictionMap
            origin={mission.lastKnownPosition}
            result={mission.simulationResult}
            searchArea={mission.searchArea}
            showHeatmap
            showEllipse
            rescueRoute={decision.recommendedRoute}
            showVessels={vessels}
            height={MAP_PANEL_HEIGHT}
          />
        </GlassCard>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: MAP_PANEL_HEIGHT, overflowY: 'auto' }}>
          <GlassCard sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocalHospitalIcon color="success" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600}>
                Closest Rescue Station
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700}>{decision.closestStation.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {decision.closestStation.distanceKm} km · ETA {decision.closestStation.etaMinutes} min
            </Typography>
          </GlassCard>

          <GlassCard sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DirectionsBoatIcon color="secondary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600}>
                Nearest Patrol Vessel
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700}>
              {decision.nearestVessel.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {decision.nearestVessel.callSign} · {decision.nearestVessel.distanceKm} km · ETA {decision.nearestVessel.etaMinutes} min
            </Typography>
            <Chip label={decision.nearestVessel.status.replace('_', ' ')} size="small" sx={{ mt: 0.5 }} />
          </GlassCard>

          <GlassCard sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <RouteIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600}>
                Search Expansion
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={700} color="warning.main">
              +{decision.searchExpansionKm} km
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total est. search: {decision.totalEstimatedSearchHours}h
            </Typography>
          </GlassCard>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2.5, mb: 2.5 }}>
        <GlassCard sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Priority Search Zones
          </Typography>
          <List dense disablePadding>
            {decision.searchZones.map((zone) => (
              <ListItem key={zone.id} disablePadding sx={{ mb: 0.75 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`#${zone.priority}`} size="small" sx={{ height: 20 }} />
                      <Typography variant="body2" fontWeight={600}>{zone.name}</Typography>
                    </Box>
                  }
                  secondary={`${(zone.probability * 100).toFixed(0)}% · ~${zone.estimatedSearchHours}h search`}
                />
              </ListItem>
            ))}
          </List>
        </GlassCard>

        <GlassCard sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Risk Alerts
          </Typography>
          {decision.riskAlerts.map((alert) => (
            <Alert
              key={alert.id}
              severity={alert.level === 'critical' ? 'error' : alert.level === 'warning' ? 'warning' : 'info'}
              sx={{ mb: 1, py: 0 }}
              icon={<WarningAmberIcon fontSize="small" />}
            >
              <Typography variant="caption" fontWeight={700} display="block">{alert.title}</Typography>
              <Typography variant="caption">{alert.message}</Typography>
            </Alert>
          ))}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1.5, mb: 1 }}>
            Weather Warnings
          </Typography>
          {decision.weatherWarnings.map((w) => (
            <Box
              key={w.id}
              sx={{
                p: 1,
                mb: 0.75,
                borderRadius: 1,
                bgcolor: alpha(ALERT_COLORS[w.level], 0.08),
                borderLeft: `3px solid ${ALERT_COLORS[w.level]}`,
              }}
            >
              <Typography variant="caption" fontWeight={700}>{w.title}</Typography>
              <Typography variant="caption" color="text.secondary" display="block">{w.message}</Typography>
            </Box>
          ))}
        </GlassCard>

        <GlassCard sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <PsychologyIcon color="secondary" />
            <Typography variant="subtitle2" fontWeight={600}>
              AI Recommendations
            </Typography>
          </Box>
          {decision.aiRecommendations.map((rec, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                gap: 1.5,
                mb: 1.25,
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              }}
            >
              <Typography variant="caption" fontWeight={700} color="secondary.main">
                {i + 1}.
              </Typography>
              <Typography variant="caption" lineHeight={1.6}>{rec}</Typography>
            </Box>
          ))}
        </GlassCard>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/missions/${missionId}/tracking`)}>
          Back to Live Tracking
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/missions/active')}
        >
          Continue to Mission Management
        </Button>
      </Box>
    </LaptopContainer>
  );
}
