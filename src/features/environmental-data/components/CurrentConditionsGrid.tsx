import { Box, Typography, Grid, Chip, alpha, Skeleton } from '@mui/material';
import AirIcon from '@mui/icons-material/Air';
import WavesIcon from '@mui/icons-material/Waves';
import WaterIcon from '@mui/icons-material/Water';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { EnvironmentalSnapshot } from '../types';
import { environmentalService } from '../services/environmentalService';
import { DirectionCompass } from './DirectionCompass';

interface ConditionCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  color: string;
  chip?: string;
}

function ConditionCard({ icon, title, value, subtitle, color, chip }: ConditionCardProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(color, 0.06),
        border: `1px solid ${alpha(color, 0.2)}`,
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{ color }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
        {chip && <Chip label={chip} size="small" sx={{ ml: 'auto', height: 20, fontSize: '0.65rem' }} />}
      </Box>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

interface CurrentConditionsGridProps {
  data?: EnvironmentalSnapshot;
  loading?: boolean;
}

export function CurrentConditionsGrid({ data, loading }: CurrentConditionsGridProps) {
  if (loading || !data) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid item xs={6} md={4} key={i}>
            <Skeleton variant="rounded" height={100} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={6} md={4}>
        <ConditionCard
          icon={<AirIcon />}
          title="WIND SPEED"
          value={`${data.wind.speed} kn`}
          subtitle={`Gusts: ${data.wind.gust} kn · ${environmentalService.getCompassLabel(data.wind.direction)}`}
          color="#00d4ff"
        />
      </Grid>
      <Grid item xs={6} md={4}>
        <ConditionCard
          icon={<WavesIcon />}
          title="OCEAN CURRENT"
          value={`${data.oceanCurrent.speed} kn`}
          subtitle={`Direction: ${data.oceanCurrent.direction}° ${environmentalService.getCompassLabel(data.oceanCurrent.direction)}`}
          color="#1e6fd9"
        />
      </Grid>
      <Grid item xs={6} md={4}>
        <ConditionCard
          icon={<WaterIcon />}
          title="WAVE HEIGHT"
          value={`${data.waves.height} m`}
          subtitle={`Period: ${data.waves.period}s · Dir: ${data.waves.direction}°`}
          color="#6366f1"
        />
      </Grid>
      <Grid item xs={6} md={4}>
        <ConditionCard
          icon={<ThermostatIcon />}
          title="SEA TEMPERATURE"
          value={`${data.seaTemperature}°C`}
          subtitle="Surface temperature"
          color="#f59e0b"
        />
      </Grid>
      <Grid item xs={6} md={4}>
        <ConditionCard
          icon={<TrendingUpIcon />}
          title="TIDE"
          value={`${data.tide.level} m`}
          subtitle={`State: ${data.tide.state}`}
          color="#10b981"
          chip={data.tide.state.toUpperCase()}
        />
      </Grid>
      <Grid item xs={6} md={4}>
        <ConditionCard
          icon={<VisibilityIcon />}
          title="VISIBILITY"
          value={`${data.visibility.distance} km`}
          subtitle={`Condition: ${data.visibility.condition.replace('_', ' ')}`}
          color="#ec4899"
          chip={data.visibility.condition.replace('_', ' ').toUpperCase()}
        />
      </Grid>

      <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <DirectionCompass direction={data.wind.direction} label="Wind Direction" color="#00d4ff" />
          <DirectionCompass
            direction={data.oceanCurrent.direction}
            label="Current Direction"
            color="#1e6fd9"
          />
          <DirectionCompass direction={data.waves.direction} label="Wave Direction" color="#6366f1" />
        </Box>
      </Grid>
    </Grid>
  );
}
