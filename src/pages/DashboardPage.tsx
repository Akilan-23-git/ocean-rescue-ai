import { Box, Grid, Button, Typography, alpha } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RadarIcon from '@mui/icons-material/Radar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { useMissions } from '@/features/mission/hooks/useMissions';
import { OBJECT_TYPES } from '@/constants';
import { formatCoordinates } from '@/utils';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: missions = [] } = useMissions();

  const activeMissions = missions.filter((m) => m.status === 'active' || m.status === 'simulating');
  const completedMissions = missions.filter((m) => m.status === 'completed');
  const recentMissions = missions.slice(0, 5);

  return (
    <Box>
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

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Missions"
            value={missions.length}
            icon={<RadarIcon />}
            color="#1e6fd9"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Missions"
            value={activeMissions.length}
            subtitle="Currently operational"
            icon={<TrendingUpIcon />}
            color="#00d4ff"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={completedMissions.length}
            icon={<CheckCircleIcon />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Status"
            value="Online"
            subtitle="All services operational"
            icon={<AccessTimeIcon />}
            color="#10b981"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
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
                  <StatusChip status={mission.status} />
                </Box>
              ))
            )}
          </GlassCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <GlassCard sx={{ p: 3 }} delay={0.1}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Start
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Begin a new rescue operation in 2 phases:
            </Typography>
            {[
              { phase: 1, title: 'Mission Creation', desc: 'Define incident details and object type' },
              { phase: 2, title: 'Incident Location', desc: 'Set last known position on ocean map' },
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
        </Grid>
      </Grid>
    </Box>
  );
}
