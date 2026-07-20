import { Box, Typography, alpha } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  badge?: ReactNode;
}

export function PageHeader({ title, subtitle, action, badge }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            {title}
          </Typography>
          {badge}
        </Box>
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
}

interface PhaseIndicatorProps {
  currentPhase: number;
  totalPhases: number;
  label: string;
}

export function PhaseIndicator({ currentPhase, totalPhases, label }: PhaseIndicatorProps) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 0.75,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
        border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
      }}
    >
      <Typography variant="caption" color="secondary" fontWeight={700}>
        PHASE {currentPhase}/{totalPhases}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        · {label}
      </Typography>
    </Box>
  );
}
