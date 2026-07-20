import { Chip, type ChipProps } from '@mui/material';
import type { MissionStatus } from '@/types';

const statusConfig: Record<
  MissionStatus,
  { label: string; color: ChipProps['color']; variant?: 'filled' | 'outlined' }
> = {
  draft: { label: 'Draft', color: 'default', variant: 'outlined' },
  active: { label: 'Active', color: 'success' },
  simulating: { label: 'Simulating', color: 'info' },
  completed: { label: 'Completed', color: 'primary' },
  cancelled: { label: 'Cancelled', color: 'error', variant: 'outlined' },
};

interface StatusChipProps {
  status: MissionStatus;
  size?: ChipProps['size'];
}

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const config = statusConfig[status];
  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant={config.variant ?? 'filled'}
      sx={{ fontWeight: 600, letterSpacing: '0.02em' }}
    />
  );
}
