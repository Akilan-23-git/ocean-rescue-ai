import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { TopNavBar } from '@/components/layout/TopNavBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { EmergencyAlertBanner } from '@/components/emergency/EmergencyAlertBanner';
import { useLayout } from '@/context/LayoutContext';
import { TOPBAR_HEIGHT } from '@/constants';
import { LAPTOP_MIN_WIDTH, CONTENT_PADDING_X, CONTENT_PADDING_Y } from '@/constants/layout';

export function DashboardLayout() {
  const { sidebarWidth } = useLayout();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        minWidth: LAPTOP_MIN_WIDTH,
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <TopNavBar />
      <Sidebar />
      <EmergencyAlertBanner />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${sidebarWidth}px`,
          mt: `${TOPBAR_HEIGHT}px`,
          width: `calc(100% - ${sidebarWidth}px)`,
          height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: `${CONTENT_PADDING_X}px`,
          py: `${CONTENT_PADDING_Y}px`,
          transition: 'margin-left 0.25s ease',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
