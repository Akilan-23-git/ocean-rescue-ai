import { Box, type SxProps, type Theme } from '@mui/material';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';

interface LaptopContainerProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  fullWidth?: boolean;
}

/** Constrains content to laptop-optimal width and padding */
export function LaptopContainer({ children, sx, fullWidth }: LaptopContainerProps) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: fullWidth ? '100%' : CONTENT_MAX_WIDTH,
        mx: fullWidth ? 0 : 'auto',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
