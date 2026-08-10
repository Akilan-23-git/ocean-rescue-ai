import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { useState } from 'react';
import type { ForecastPoint } from '../types';

interface ForecastChartProps {
  data: ForecastPoint[];
  title: string;
  type: 'weather' | 'current';
}

function formatHour(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid rgba(148,163,184,0.2)',
  borderRadius: 8,
  color: '#f1f5f9',
};

export function ForecastChart({ data, title, type }: ForecastChartProps) {
  const [range, setRange] = useState<'24h' | '48h' | '72h'>('24h');
  const limit = range === '24h' ? 24 : range === '48h' ? 48 : 72;
  const chartData = data.slice(0, limit).map((p) => ({
    ...p,
    time: formatHour(p.timestamp),
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={range}
          exclusive
          onChange={(_, v) => v && setRange(v)}
        >
          <ToggleButton value="24h">24h</ToggleButton>
          <ToggleButton value="48h">48h</ToggleButton>
          <ToggleButton value="72h">72h</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <ResponsiveContainer width="100%" height={260}>
        {type === 'weather' ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Area
              type="monotone"
              dataKey="windSpeed"
              name="Wind (kn)"
              stroke="#00d4ff"
              fill="url(#windGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="waveHeight"
              name="Waves (m)"
              stroke="#6366f1"
              fill="url(#waveGrad)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="visibility"
              name="Visibility (km)"
              stroke="#ec4899"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line
              type="monotone"
              dataKey="currentSpeed"
              name="Current (kn)"
              stroke="#1e6fd9"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              name="Temp (°C)"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </Box>
  );
}
