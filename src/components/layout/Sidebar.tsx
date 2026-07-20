import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Tooltip,
  Divider,
  alpha,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RadarIcon from '@mui/icons-material/Radar';
import HistoryIcon from '@mui/icons-material/History';
import CloudIcon from '@mui/icons-material/Cloud';
import WavesIcon from '@mui/icons-material/Waves';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { motion } from 'framer-motion';
import { useLayout } from '@/context/LayoutContext';
import { NAV_ITEMS, TOPBAR_HEIGHT } from '@/constants';

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <DashboardIcon />,
  AddCircleOutline: <AddCircleOutlineIcon />,
  Radar: <RadarIcon />,
  History: <HistoryIcon />,
  Cloud: <CloudIcon />,
  Waves: <WavesIcon />,
  Analytics: <AnalyticsIcon />,
  Description: <DescriptionIcon />,
  Settings: <SettingsIcon />,
  HelpOutline: <HelpOutlineIcon />,
};

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, sidebarWidth } = useLayout();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          transition: 'width 0.25s ease',
          overflowX: 'hidden',
          mt: `${TOPBAR_HEIGHT}px`,
          height: `calc(100% - ${TOPBAR_HEIGHT}px)`,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 1 }}>
        <List sx={{ flex: 1, px: 1 }}>
          {NAV_ITEMS.map((item, index) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            const button = (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  minHeight: 44,
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  px: sidebarCollapsed ? 1 : 2,
                  '&.Mui-selected': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                    borderLeft: (theme) => `3px solid ${theme.palette.secondary.main}`,
                    '& .MuiListItemIcon-root': { color: 'secondary.main' },
                    '& .MuiListItemText-primary': { color: 'text.primary', fontWeight: 600 },
                  },
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
                component={motion.div}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: sidebarCollapsed ? 0 : 40,
                    justifyContent: 'center',
                    color: isActive ? 'secondary.main' : 'text.secondary',
                  }}
                >
                  {iconMap[item.icon]}
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.875rem' }}
                  />
                )}
              </ListItemButton>
            );

            return sidebarCollapsed ? (
              <Tooltip key={item.path} title={item.label} placement="right">
                {button}
              </Tooltip>
            ) : (
              button
            );
          })}
        </List>

        <Divider sx={{ mx: 2, mb: 1 }} />

        <Box sx={{ px: 1 }}>
          <Tooltip title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <ListItemButton
              onClick={toggleSidebar}
              sx={{
                borderRadius: 2,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                minHeight: 40,
              }}
            >
              <ListItemIcon sx={{ minWidth: sidebarCollapsed ? 0 : 40, justifyContent: 'center' }}>
                <ChevronLeftIcon
                  sx={{
                    transform: sidebarCollapsed ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.25s',
                  }}
                />
              </ListItemIcon>
              {!sidebarCollapsed && (
                <ListItemText
                  primary="Collapse"
                  primaryTypographyProps={{ fontSize: '0.8125rem', color: 'text.secondary' }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </Box>

        {!sidebarCollapsed && (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              MSAR v1.0.0
            </Typography>
            <Typography variant="caption" color="text.secondary">
              OpenDrift Integration Ready
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
