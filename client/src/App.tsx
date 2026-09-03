import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { ShipmentDetailPage } from './pages/ShipmentDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NewShipmentModal } from './components/NewShipmentModal';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App: React.FC = () => {
  const [isNewShipmentModalOpen, setIsNewShipmentModalOpen] = useState(false);

  return (
    <ErrorBoundary>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#F4F3EF] text-[#252525] font-sans">
          {/* Navbar Header */}
          <Navbar onOpenNewShipmentModal={() => setIsNewShipmentModalOpen(true)} />

          {/* Main Workspace with Sidebar */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-4 lg:p-8">
              <Routes>
                <Route
                  path="/"
                  element={<OverviewPage onOpenNewShipmentModal={() => setIsNewShipmentModalOpen(true)} />}
                />
                <Route
                  path="/shipments"
                  element={<ShipmentsPage onOpenNewShipmentModal={() => setIsNewShipmentModalOpen(true)} />}
                />
                <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
          </div>

          {/* Global New Shipment Modal */}
          <NewShipmentModal
            isOpen={isNewShipmentModalOpen}
            onClose={() => setIsNewShipmentModalOpen(false)}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
