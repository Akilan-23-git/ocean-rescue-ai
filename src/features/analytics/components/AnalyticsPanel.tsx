import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import StraightenIcon from '@mui/icons-material/Straighten';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader, PhaseIndicator } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { LaptopContainer } from '@/components/layout/LaptopContainer';
import { useMissions } from '@/features/mission/hooks/useMissions';
import { analyticsService } from '@/features/analytics/services/analyticsService';

const PIE_COLORS = ['#00d4ff', '#1e6fd9', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];
const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid rgba(148,163,184,0.2)',
  borderRadius: 8,
};

export function AnalyticsPanel() {
  const navigate = useNavigate();
  const { data: missions = [] } = useMissions();
  const [trendMode, setTrendMode] = useState<'monthly' | 'yearly'>('monthly');

  const summary = useMemo(() => analyticsService.compute(missions), [missions]);
  const trendData =
    trendMode === 'monthly'
      ? summary.monthlyTrends.map((t) => ({ label: t.month, missions: t.missions, rescues: t.rescues }))
      : summary.yearlyTrends.map((t) => ({ label: t.year, missions: t.missions, rescues: t.rescues }));

  return (
    <LaptopContainer>
      <PageHeader
        title="Analytics"
        subtitle="System performance insights across missions, drift models, and AI accuracy"
        badge={<PhaseIndicator currentPhase={11} totalPhases={13} label="Analytics" />}
        action={
          <Button variant="outlined" onClick={() => navigate('/missions/active')}>
            View Missions
          </Button>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, mb: 2.5 }}>
        <StatCard title="Total Missions" value={summary.totalMissions} icon={<TrendingUpIcon />} color="#1e6fd9" />
        <StatCard title="Successful Rescues" value={summary.successfulRescues} icon={<CheckCircleIcon />} color="#10b981" />
        <StatCard title="Prediction Accuracy" value={`${summary.predictionAccuracy}%`} icon={<SpeedIcon />} color="#00d4ff" />
        <StatCard title="Avg Drift Distance" value={`${summary.averageDriftKm} km`} icon={<StraightenIcon />} color="#f59e0b" />
        <StatCard title="Avg Search Time" value={`${summary.averageSearchHours} h`} icon={<AccessTimeIcon />} color="#6366f1" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 2.5, mb: 2.5 }}>
        <GlassCard sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Mission Trends
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={trendMode}
              onChange={(_, v) => v && setTrendMode(v)}
            >
              <ToggleButton value="monthly">Monthly</ToggleButton>
              <ToggleButton value="yearly">Yearly</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="missions" name="Missions" stroke="#00d4ff" strokeWidth={2} />
              <Line type="monotone" dataKey="rescues" name="Rescues" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Object Type Statistics
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={summary.objectTypeStats}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {summary.objectTypeStats.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <GlassCard sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Weather Impact Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Relative contribution of environmental factors to drift uncertainty
          </Typography>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={summary.weatherImpact} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
              <YAxis type="category" dataKey="factor" width={110} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="impact" name="Impact %" fill="#1e6fd9" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PsychologyIcon color="secondary" />
            <Typography variant="subtitle1" fontWeight={600}>
              AI Model Performance Comparison
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Average confidence / accuracy by model selection
          </Typography>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={summary.aiModelPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="model" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="accuracy" name="Accuracy %" fill="#00d4ff" radius={[6, 6, 0, 0]} />
              <Bar dataKey="runs" name="Runs" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </Box>
    </LaptopContainer>
  );
}
