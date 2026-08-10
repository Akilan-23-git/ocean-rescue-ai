import { Box, Typography, Slider, alpha } from '@mui/material';
import { useState } from 'react';
import type { ForecastPoint } from '../types';
import { environmentalService } from '../services/environmentalService';

interface EnvironmentalTimelineProps {
  data: ForecastPoint[];
}

export function EnvironmentalTimeline({ data }: EnvironmentalTimelineProps) {
  const [index, setIndex] = useState(0);
  const point = data[index];
  if (!point) return null;

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  const metrics = [
    { label: 'Wind', value: `${point.windSpeed.toFixed(1)} kn`, sub: environmentalService.getCompassLabel(point.windDirection) },
    { label: 'Current', value: `${point.currentSpeed.toFixed(2)} kn`, sub: `${point.currentDirection}°` },
    { label: 'Waves', value: `${point.waveHeight.toFixed(1)} m`, sub: 'significant height' },
    { label: 'Temp', value: `${point.temperature.toFixed(1)}°C`, sub: 'sea surface' },
    { label: 'Visibility', value: `${point.visibility.toFixed(1)} km`, sub: 'horizontal' },
  ];

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Environmental Timeline
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Scrub through forecast hours to see how conditions evolve
      </Typography>

      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
          border: '1px solid',
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Typography variant="caption" color="secondary" fontWeight={700}>
          {formatTime(point.timestamp)}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1.5 }}>
          {metrics.map((m) => (
            <Box key={m.label} sx={{ minWidth: 90 }}>
              <Typography variant="caption" color="text.secondary">
                {m.label}
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {m.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {m.sub}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Slider
        value={index}
        min={0}
        max={data.length - 1}
        onChange={(_, v) => setIndex(v as number)}
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => `+${v}h`}
        marks={[
          { value: 0, label: 'Now' },
          { value: 24, label: '+24h' },
          { value: 48, label: '+48h' },
          { value: 71, label: '+72h' },
        ]}
        sx={{
          '& .MuiSlider-thumb': { bgcolor: 'secondary.main' },
          '& .MuiSlider-track': { bgcolor: 'secondary.main' },
        }}
      />
    </Box>
  );
}
