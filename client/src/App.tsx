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
import { Toast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App: React.FC = () => {
  const [isNewShipmentModalOpen, setIsNewShipmentModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDispatchSuccess = (aggregateId: string) => {
    setToastMessage(`Container ${aggregateId} dispatched successfully via immutable event stream.`);
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#F4F3EF] dark:bg-[#141414] text-[#252525] dark:text-[#F5F5F0] font-sans transition-colors">
          {/* Navbar Header */}
          <Navbar onOpenNewShipmentModal={() => setIsNewShipmentModalOpen(true)} />

          {/* Main Workspace with Sidebar */}
          <div className="flex flex-1 overflow-hidden bg-[#F4F3EF] dark:bg-[#141414] transition-colors">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#F4F3EF] dark:bg-[#141414] transition-colors">
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

          {/* Global New Shipment Modal with confirmation step */}
          <NewShipmentModal
            isOpen={isNewShipmentModalOpen}
            onClose={() => setIsNewShipmentModalOpen(false)}
            onDispatchSuccess={handleDispatchSuccess}
          />

          {/* Global Notification Toast */}
          <Toast
            message={toastMessage || ''}
            isVisible={!!toastMessage}
            onClose={() => setToastMessage(null)}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
