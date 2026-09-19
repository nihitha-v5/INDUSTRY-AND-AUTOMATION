import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { Sidebar } from './components/layouts/Sidebar';
import { Navbar } from './components/layouts/Navbar';

// 14 Pages Imports
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OverviewPage } from './pages/OverviewPage';
import { DataManagementPage } from './pages/DataManagementPage';
import { VisualInspectionPage } from './pages/VisualInspectionPage';
import { RootCausePage } from './pages/RootCausePage';
import { ProductionFlowPage } from './pages/ProductionFlowPage';
import { BottleneckPage } from './pages/BottleneckPage';
import { EconomicsPage } from './pages/EconomicsPage';
import { SimulationPage } from './pages/SimulationPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ModelManagementPage } from './pages/ModelManagementPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-industrial-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Dashboard Layout (14 Pages) */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/data-management" element={<DataManagementPage />} />
              <Route path="/visual-inspection" element={<VisualInspectionPage />} />
              <Route path="/root-cause" element={<RootCausePage />} />
              <Route path="/production-flow" element={<ProductionFlowPage />} />
              <Route path="/bottlenecks" element={<BottleneckPage />} />
              <Route path="/economics" element={<EconomicsPage />} />
              <Route path="/simulation" element={<SimulationPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/models" element={<ModelManagementPage />} />
              <Route path="/model-performance" element={<ModelPerformancePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
