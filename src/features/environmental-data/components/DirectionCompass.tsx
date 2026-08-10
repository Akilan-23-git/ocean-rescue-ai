import { Box, Typography, alpha } from '@mui/material';
import { themeTokens } from '@/theme';

interface CompassProps {
  direction: number;
  label: string;
  size?: number;
  color?: string;
}

export function DirectionCompass({ direction, label, size = 100, color }: CompassProps) {
  const c = color ?? themeTokens.cyan;

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          mx: 'auto',
          borderRadius: '50%',
          border: `2px solid ${alpha(c, 0.3)}`,
          bgcolor: alpha(c, 0.05),
        }}
      >
        {['N', 'E', 'S', 'W'].map((dir, i) => (
          <Typography
            key={dir}
            variant="caption"
            sx={{
              position: 'absolute',
              fontWeight: 700,
              fontSize: '0.625rem',
              color: 'text.secondary',
              ...(i === 0 && { top: 4, left: '50%', transform: 'translateX(-50%)' }),
              ...(i === 1 && { right: 6, top: '50%', transform: 'translateY(-50%)' }),
              ...(i === 2 && { bottom: 4, left: '50%', transform: 'translateX(-50%)' }),
              ...(i === 3 && { left: 6, top: '50%', transform: 'translateY(-50%)' }),
            }}
          >
            {dir}
          </Typography>
        ))}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 3,
            height: size * 0.38,
            bgcolor: c,
            transformOrigin: 'bottom center',
            transform: `translate(-50%, -100%) rotate(${direction}deg)`,
            borderRadius: 2,
            boxShadow: `0 0 8px ${alpha(c, 0.5)}`,
            transition: 'transform 0.6s ease',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: c,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {direction}°
      </Typography>
    </Box>
  );
}
