import { Box, type SxProps, type Theme } from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
  delay?: number;
}

export function GlassCard({ children, sx, delay = 0 }: GlassCardProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      sx={{
        background: 'rgba(17, 24, 39, 0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(148, 163, 184, 0.12)',
        borderRadius: 3,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25)',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
