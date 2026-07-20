import { Box, Typography, Skeleton } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
}

export function StatCard({ title, value, subtitle, icon, color, loading }: StatCardProps) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
        '&::before': color
          ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: 4,
              height: '100%',
              bgcolor: color,
            }
          : {},
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={80} height={36} />
          ) : (
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box sx={{ color: color ?? 'primary.main', opacity: 0.8 }}>{icon}</Box>
        )}
      </Box>
    </Box>
  );
}
