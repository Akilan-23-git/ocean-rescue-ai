import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { NewMissionPage } from '@/pages/NewMissionPage';
import { IncidentLocationPage } from '@/pages/IncidentLocationPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'missions/new', element: <NewMissionPage /> },
      { path: 'missions/:missionId/location', element: <IncidentLocationPage /> },
      {
        path: 'missions/active',
        element: (
          <PlaceholderPage title="Active Missions" subtitle="Monitor ongoing rescue operations" phase={9} />
        ),
      },
      {
        path: 'missions/history',
        element: (
          <PlaceholderPage title="Prediction History" subtitle="Review past drift predictions" phase={10} />
        ),
      },
      {
        path: 'weather',
        element: <PlaceholderPage title="Weather" subtitle="Environmental conditions dashboard" phase={3} />,
      },
      {
        path: 'ocean-currents',
        element: (
          <PlaceholderPage title="Ocean Currents" subtitle="Current and forecast data" phase={3} />
        ),
      },
      {
        path: 'analytics',
        element: <PlaceholderPage title="Analytics" subtitle="System performance insights" phase={11} />,
      },
      {
        path: 'reports',
        element: <PlaceholderPage title="Reports" subtitle="Generate official documentation" phase={12} />,
      },
      {
        path: 'settings',
        element: <PlaceholderPage title="Settings" subtitle="System administration" phase={13} />,
      },
      {
        path: 'help',
        element: <PlaceholderPage title="Help" subtitle="Documentation and support" />,
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
