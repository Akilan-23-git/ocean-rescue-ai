import { createTheme, alpha } from '@mui/material/styles';

const palette = {
  deepNavy: '#0a0e1a',
  cardNavy: '#111827',
  cardNavyLight: '#1a2234',
  oceanBlue: '#1e6fd9',
  oceanBlueLight: '#3d8ef0',
  cyan: '#00d4ff',
  cyanDim: '#00a8cc',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: 'rgba(148, 163, 184, 0.12)',
  glass: 'rgba(17, 24, 39, 0.75)',
};

export const maritimeTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: palette.oceanBlue,
      light: palette.oceanBlueLight,
      dark: '#1557b0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: palette.cyan,
      light: '#33ddff',
      dark: palette.cyanDim,
      contrastText: '#0a0e1a',
    },
    success: { main: palette.success },
    warning: { main: palette.warning },
    error: { main: palette.danger },
    background: {
      default: palette.deepNavy,
      paper: palette.cardNavy,
    },
    text: {
      primary: palette.textPrimary,
      secondary: palette.textSecondary,
    },
    divider: palette.border,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500, fontSize: '0.8125rem' },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.deepNavy,
          backgroundImage: `
            radial-gradient(ellipse at 20% 0%, ${alpha(palette.oceanBlue, 0.08)} 0%, transparent 50%),
            radial-gradient(ellipse at 80% 100%, ${alpha(palette.cyan, 0.05)} 0%, transparent 50%)
          `,
          scrollbarColor: `${alpha(palette.cyan, 0.3)} transparent`,
        },
        '*::-webkit-scrollbar': { width: 6, height: 6 },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(palette.cyan, 0.3),
          borderRadius: 3,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: palette.cardNavy,
          border: `1px solid ${palette.border}`,
          boxShadow: `0 4px 24px ${alpha('#000', 0.25)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${palette.oceanBlue} 0%, ${palette.oceanBlueLight} 100%)`,
          boxShadow: `0 4px 14px ${alpha(palette.oceanBlue, 0.35)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${palette.oceanBlueLight} 0%, ${palette.oceanBlue} 100%)`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: alpha(palette.cardNavyLight, 0.5),
            '& fieldset': { borderColor: palette.border },
            '&:hover fieldset': { borderColor: alpha(palette.cyan, 0.4) },
            '&.Mui-focused fieldset': { borderColor: palette.cyan },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: palette.cardNavy,
          borderRight: `1px solid ${palette.border}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(palette.cardNavy, 0.85),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${palette.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: { fontWeight: 500 },
      },
    },
  },
});

export const themeTokens = palette;
