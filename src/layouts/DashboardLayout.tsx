import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { TopNavBar } from '@/components/layout/TopNavBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useLayout } from '@/context/LayoutContext';
import { TOPBAR_HEIGHT } from '@/constants';

export function DashboardLayout() {
  const { sidebarWidth } = useLayout();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopNavBar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${sidebarWidth}px`,
          mt: `${TOPBAR_HEIGHT}px`,
          p: { xs: 2, sm: 3 },
          transition: 'margin-left 0.25s ease',
          minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
