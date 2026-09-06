import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Alert } from '@mui/material';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import { useMissions } from '@/features/mission/hooks/useMissions';

export function PredictionHistoryPage() {
  const navigate = useNavigate();
  const { data: missions = [] } = useMissions();

  const replayable = useMemo(
    () => missions.filter((m) => m.simulationResult),
    [missions],
  );

  return (
    <LaptopContainer>
      <PageHeader
        title="Prediction History"
        subtitle="Select a mission to open historical replay and accuracy analysis"
        badge={<PhaseIndicator currentPhase={10} totalPhases={13} label="Historical Replay" />}
      />
      <GlassCard sx={{ p: 3 }}>
        {replayable.length === 0 ? (
          <Alert severity="info">
            No completed simulations yet. Run a mission through Phase 4–5 first.
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => navigate('/missions/new')}>
                New Simulation
              </Button>
            </Box>
          </Alert>
        ) : (
          replayable.map((m) => (
            <Button
              key={m.id}
              variant="outlined"
              fullWidth
              sx={{ mb: 1, justifyContent: 'flex-start', textTransform: 'none' }}
              onClick={() => navigate(`/missions/${m.id}/replay`)}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={600}>
                  {m.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {m.missionId} · {m.simulationResult?.confidenceScore}% confidence ·{' '}
                  {m.simulationResult?.driftDistanceKm} km drift
                </Typography>
              </Box>
            </Button>
          ))
        )}
      </GlassCard>
    </LaptopContainer>
  );
}
