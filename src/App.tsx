import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { maritimeTheme } from '@/theme';
import { LayoutProvider } from '@/context/LayoutContext';
import { MissionProvider } from '@/context/MissionContext';
import { EmergencyProvider } from '@/context/EmergencyContext';
import { router } from '@/routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={maritimeTheme}>
        <CssBaseline />
        <LayoutProvider>
          <MissionProvider>
            <EmergencyProvider>
              <RouterProvider router={router} />
            </EmergencyProvider>
          </MissionProvider>
        </LayoutProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
