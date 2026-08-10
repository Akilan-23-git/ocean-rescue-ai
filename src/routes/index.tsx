import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { NewMissionPage } from '@/pages/NewMissionPage';
import { IncidentLocationPage } from '@/pages/IncidentLocationPage';
import { EnvironmentalDataPage } from '@/pages/EnvironmentalDataPage';
import { SimulationSetupPage } from '@/pages/SimulationSetupPage';
import { DriftPredictionPage } from '@/pages/DriftPredictionPage';
import { SearchAreaPage } from '@/pages/SearchAreaPage';
import { LiveTrackingPage } from '@/pages/LiveTrackingPage';
import { RescueDecisionPage } from '@/pages/RescueDecisionPage';
import { WeatherPage } from '@/pages/WeatherPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { SosEmergencyPage } from '@/pages/SosEmergencyPage';
import { MissionManagementPage } from '@/pages/MissionManagementPage';

export const router = createBrowserRouter([
  {
    path: '/sos',
    element: <SosEmergencyPage />,
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'missions/new', element: <NewMissionPage /> },
      { path: 'missions/:missionId/location', element: <IncidentLocationPage /> },
      { path: 'missions/:missionId/environment', element: <EnvironmentalDataPage /> },
      { path: 'missions/:missionId/simulation', element: <SimulationSetupPage /> },
      { path: 'missions/:missionId/prediction', element: <DriftPredictionPage /> },
      { path: 'missions/:missionId/search-area', element: <SearchAreaPage /> },
      { path: 'missions/:missionId/tracking', element: <LiveTrackingPage /> },
      { path: 'missions/:missionId/decisions', element: <RescueDecisionPage /> },
      { path: 'missions/active', element: <MissionManagementPage /> },
      {
        path: 'missions/history',
        element: (
          <PlaceholderPage title="Prediction History" subtitle="Review past drift predictions" phase={10} />
        ),
      },
      { path: 'weather', element: <WeatherPage /> },
      { path: 'ocean-currents', element: <Navigate to="/weather" replace /> },
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
