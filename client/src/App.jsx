import React from 'react';
import Navbar from './components/layout/Navbar';
import SearchBar from './components/dashboard/SearchBar';
import RecentShipments from './components/dashboard/RecentShipments';
import EmptyState from './components/dashboard/EmptyState';
import StateSummaryCard from './components/dashboard/StateSummaryCard';
import EventTimeline from './components/timeline/EventTimeline';
import { useShipmentStore } from './store/useShipmentStore';
import { Database, ShieldCheck, Activity } from 'lucide-react';

export const App = () => {
  const { searchedId, events, isLoading } = useShipmentStore();

  const hasSearch = searchedId || events || isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search Hero Header */}
        <section className="mb-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-semibold border border-teal-500/20 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Forensic Logistics Audit Engine</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Track Shipments via Immutable Event Streams
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            No state mutations. Every event is permanently logged and folded on demand to derive ground-truth status.
          </p>

          <div className="pt-2">
            <SearchBar />
            <RecentShipments />
          </div>
        </section>

        {/* Dynamic Display Area */}
        {!hasSearch ? (
          <EmptyState />
        ) : (
          <section className="space-y-6">
            <StateSummaryCard />
            <EventTimeline />
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Audit Trail</span>
            <span>— Week 1 & 2 CQRS Event Sourcing Build</span>
          </div>
          <p className="font-mono text-[11px]">
            Append-Only Log • MERN Architecture • No State Overwrites
          </p>
        </div>
      </footer>

    </div>
  );
};

export default App;
