import { Box, Button, Typography, Chip, alpha } from '@mui/material';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RadarIcon from '@mui/icons-material/Radar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { useMissions } from '@/features/mission/hooks/useMissions';
import { useEmergencyAlerts } from '@/context/EmergencyContext';
import { OBJECT_TYPES } from '@/constants';
import { formatCoordinates } from '@/utils';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: missions = [] } = useMissions();
  const { activeEmergencyCount } = useEmergencyAlerts();

  const activeMissions = missions.filter(
    (m) =>
      m.status === 'active' ||
      m.status === 'simulating' ||
      m.status === 'new_emergency' ||
      m.status === 'needs_review',
  );
  const completedMissions = missions.filter((m) => m.status === 'completed');
  const emergencies = missions.filter(
    (m) => m.status === 'new_emergency' || m.status === 'needs_review',
  );
  const recentMissions = missions.slice(0, 5);

  return (
    <LaptopContainer>
      <PageHeader
        title="Operations Dashboard"
        subtitle="Maritime Search & Rescue Prediction System — Real-time mission overview"
        action={
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/missions/new')}
          >
            New Simulation
          </Button>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2.5, mb: 3 }}>
        <StatCard
            title="Total Missions"
            value={missions.length}
            icon={<RadarIcon />}
            color="#1e6fd9"
          />
        <StatCard
            title="Active Emergencies"
            value={activeEmergencyCount || emergencies.length}
            subtitle="SMS / needs review"
            icon={<WarningAmberIcon />}
            color="#ef4444"
          />
        <StatCard
            title="Active Missions"
            value={activeMissions.length}
            subtitle="Currently operational"
            icon={<TrendingUpIcon />}
            color="#00d4ff"
          />
        <StatCard
            title="Completed"
            value={completedMissions.length}
            icon={<CheckCircleIcon />}
            color="#10b981"
          />
        <StatCard
            title="System Status"
            value="Online"
            subtitle="SMS sync every 5s"
            icon={<AccessTimeIcon />}
            color="#10b981"
          />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 3 }}>
        <GlassCard sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Missions
            </Typography>
            {recentMissions.length === 0 ? (
              <Box
                sx={{
                  py: 6,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <RadarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary" gutterBottom>
                  No missions yet
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => navigate('/missions/new')}
                  sx={{ mt: 1 }}
                >
                  Create First Mission
                </Button>
              </Box>
            ) : (
              recentMissions.map((mission, i) => (
                <Box
                  key={mission.id}
                  component={motion.div}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/missions/${mission.id}/location`)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    mb: 1,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: (theme) => alpha(theme.palette.background.default, 0.4),
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.05),
                    },
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>{mission.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {mission.missionId} ·{' '}
                      {OBJECT_TYPES.find((o) => o.value === mission.objectType)?.label}
                      {mission.lastKnownPosition &&
                        ` · ${formatCoordinates(mission.lastKnownPosition.lat, mission.lastKnownPosition.lng)}`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={mission.triggerType ?? 'MANUAL'}
                      color={mission.triggerType === 'SMS' ? 'error' : 'default'}
                      variant="outlined"
                    />
                    <StatusChip status={mission.status} />
                  </Box>
                </Box>
              ))
            )}
          </GlassCard>

        <GlassCard sx={{ p: 3 }} delay={0.1}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Start
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Full mission workflow — 6 phases implemented:
            </Typography>
            {[
              { phase: 1, title: 'Mission Creation', desc: 'Define incident details and object type' },
              { phase: 2, title: 'Incident Location', desc: 'Set last known position on ocean map' },
              { phase: 3, title: 'Environmental Data', desc: 'Wind, currents, waves, and forecasts' },
              { phase: 4, title: 'Simulation Setup', desc: 'Configure drift model and particles' },
              { phase: 5, title: 'Drift Prediction', desc: 'View trajectories and AI analysis' },
              { phase: 6, title: 'Search Area', desc: 'Probability zones and search grid' },
              { phase: 7, title: 'Live Tracking', desc: 'Real-time drift monitoring & replay' },
              { phase: 8, title: 'Decision Support', desc: 'Rescue stations, vessels, AI guidance' },
            ].map((step) => (
              <Box
                key={step.phase}
                sx={{
                  display: 'flex',
                  gap: 2,
                  mb: 2,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.main',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    flexShrink: 0,
                  }}
                >
                  {step.phase}
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {step.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => navigate('/missions/new')}
            >
              Start New Mission
            </Button>
          </GlassCard>
      </Box>
    </LaptopContainer>
  );
}
