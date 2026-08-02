import React from 'react';
import { CommandCenterProvider, useCommandCenter } from './context/CommandCenterContext';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';

// Import All 11 Screens
import { LoginScreen } from './components/screens/LoginScreen';
import { DashboardOverviewScreen } from './components/screens/DashboardOverviewScreen';
import { IncidentDetailScreen } from './components/screens/IncidentDetailScreen';
import { DispatchQueueScreen } from './components/screens/DispatchQueueScreen';
import { DroneFleetScreen } from './components/screens/DroneFleetScreen';
import { PersonnelScreen } from './components/screens/PersonnelScreen';
import { StationsScreen } from './components/screens/StationsScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { UserManagementScreen } from './components/screens/UserManagementScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

const MainLayout: React.FC = () => {
  const { activeScreen, isAuthenticated } = useCommandCenter();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'login':
        return <LoginScreen />;
      case 'overview':
        return <DashboardOverviewScreen />;
      case 'incident_detail':
        return <IncidentDetailScreen />;
      case 'dispatch':
        return <DispatchQueueScreen />;
      case 'drones':
        return <DroneFleetScreen />;
      case 'personnel':
        return <PersonnelScreen />;
      case 'stations':
        return <StationsScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'users':
        return <UserManagementScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardOverviewScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#051424] bg-grid text-[#d4e4fa] antialiased flex">
      {/* Fixed Left Navigation Rail */}
      <Navigation />

      {/* Main Content Area */}
      <div className="flex-1 ml-[240px]">
        {/* Fixed Top AppBar */}
        <Header />

        {/* Dynamic Screen View Content */}
        <main className="pt-20 px-6 min-h-[calc(100vh-80px)]">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CommandCenterProvider>
      <MainLayout />
    </CommandCenterProvider>
  );
};

export default App;
