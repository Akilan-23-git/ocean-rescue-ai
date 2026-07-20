import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Badge,
  Tooltip,
  alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SailingIcon from '@mui/icons-material/Sailing';
import { useLayout } from '@/context/LayoutContext';
import { useUtcClock } from '@/hooks/useUtcClock';
import { APP_NAME, TOPBAR_HEIGHT } from '@/constants';

export function TopNavBar() {
  const { toggleSidebar } = useLayout();
  const utcTime = useUtcClock();

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ minHeight: TOPBAR_HEIGHT, px: { xs: 1.5, sm: 2 } }}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={toggleSidebar}
          sx={{ mr: 1.5 }}
          aria-label="toggle sidebar"
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 3 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            <SailingIcon sx={{ fontSize: 22, color: '#fff' }} />
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              {APP_NAME}
            </Typography>
            <Typography variant="caption" color="text.secondary" lineHeight={1}>
              Search & Rescue Prediction
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" fontFamily="monospace" fontWeight={500}>
              {utcTime}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: alpha('#10b981', 0.1),
              border: '1px solid',
              borderColor: alpha('#10b981', 0.3),
            }}
          >
            <FiberManualRecordIcon sx={{ fontSize: 10, color: '#10b981' }} />
            <Typography variant="caption" fontWeight={600} color="#10b981">
              OPERATIONAL
            </Typography>
          </Box>

          <Tooltip title="Notifications">
            <IconButton color="inherit" size="small">
              <Badge badgeContent={3} color="error">
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Coast Guard Operator">
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              CG
            </Avatar>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
