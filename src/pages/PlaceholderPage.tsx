import { Box, Typography, Button } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader } from '@/components/ui/PageHeader';

interface PlaceholderPageProps {
  title: string;
  subtitle?: string;
  phase?: number;
}

export function PlaceholderPage({ title, subtitle, phase }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <Box>
      <PageHeader title={title} subtitle={subtitle} />
      <GlassCard sx={{ p: 6, textAlign: 'center' }}>
        <ConstructionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Coming in Phase {phase ?? 'Next'}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
          This module will be available in an upcoming release. Phases 1 (Mission Creation) and 2
          (Incident Location) are currently active.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/missions/new')}>
          Start New Mission
        </Button>
      </GlassCard>
    </Box>
  );
}
