import { Box, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { useMissions } from '@/features/mission/hooks/useMissions';

export function WeatherPage() {
  const navigate = useNavigate();
  const { data: missions = [] } = useMissions();
  const withLocation = missions.filter((m) => m.lastKnownPosition);

  return (
    <Box>
      <PageHeader
        title="Weather & Environmental Data"
        subtitle="Select a mission to view environmental conditions"
      />
      <GlassCard sx={{ p: 3 }}>
        {withLocation.length === 0 ? (
          <Alert severity="info">
            No missions with a set location. Create a mission and set its incident location first.
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => navigate('/missions/new')}>
                Create Mission
              </Button>
            </Box>
          </Alert>
        ) : (
          withLocation.map((m) => (
            <Button
              key={m.id}
              variant="outlined"
              fullWidth
              sx={{ mb: 1, justifyContent: 'flex-start' }}
              onClick={() => navigate(`/missions/${m.id}/environment`)}
            >
              {m.name} — {m.missionId}
            </Button>
          ))
        )}
      </GlassCard>
    </Box>
  );
}
