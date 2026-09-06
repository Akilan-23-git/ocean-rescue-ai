import { Box, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { LaptopContainer } from '@/components/layout/LaptopContainer';

const PHASES = [
  '1 Mission Creation',
  '2 Incident Location',
  '3 Environmental Data',
  '4 Simulation Setup',
  '5 Drift Prediction',
  '6 Search Area',
  '7 Live Tracking',
  '8 Decision Support',
  '9 Mission Management',
  '10 Historical Replay',
  '11 Analytics',
  '12 Reports',
  '13 Administration',
];

export function HelpPage() {
  const navigate = useNavigate();

  return (
    <LaptopContainer>
      <PageHeader
        title="Help"
        subtitle="MSAR operator guide — full 13-phase workflow is available"
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <GlassCard sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Quick Start
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a mission, set LKP on the map, review environment, run simulation, then use search area,
            live tracking, and decision support. Manage outcomes, replay history, view analytics, export
            reports, and configure the system under Settings.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/missions/new')}>
            Start New Mission
          </Button>
        </GlassCard>
        <GlassCard sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Implemented Phases
          </Typography>
          <List dense>
            {PHASES.map((p) => (
              <ListItem key={p} disablePadding>
                <ListItemText primary={p} primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            ))}
          </List>
        </GlassCard>
      </Box>
    </LaptopContainer>
  );
}
