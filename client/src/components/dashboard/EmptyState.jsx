import React from 'react';
import { PackageSearch, ShieldCheck, GitCommit, Layers, ArrowUpRight } from 'lucide-react';
import { useShipmentStore } from '../../store/useShipmentStore';

export const EmptyState = () => {
  const { searchShipment } = useShipmentStore();

  return (
    <div className="w-full max-w-3xl mx-auto my-12 p-8 sm:p-12 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xl backdrop-blur-sm text-center animate-fadeIn">
      
      {/* Decorative Icon Graphic */}
      <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500/10 via-emerald-500/10 to-sky-500/10 dark:from-teal-500/20 dark:to-sky-500/20 border border-teal-500/30 text-teal-600 dark:text-teal-400">
        <PackageSearch className="w-10 h-10" />
        <div className="absolute -top-1 -right-1 p-1 rounded-full bg-teal-500 text-white shadow-md">
          <GitCommit className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main Heading */}
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
        Event-Sourced Logistics Ledger
      </h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-8">
        Search a shipment ID to replay its immutable append-only event stream and reconstruct its current logistics state.
      </p>

      {/* Quick Access Preset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-8 text-left">
        <button
          onClick={() => searchShipment('SHIP-1001')}
          className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all duration-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono font-bold text-sm text-teal-600 dark:text-teal-400 group-hover:underline">
              SHIP-1001
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Semiconductor Cargo • Shanghai → Long Beach (5 events, Temp Alert)
          </p>
        </button>

        <button
          onClick={() => searchShipment('SHIP-1002')}
          className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all duration-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono font-bold text-sm text-teal-600 dark:text-teal-400 group-hover:underline">
              SHIP-1002
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pharma Cold-chain • Rotterdam → Singapore (4 events, Temp Alert)
          </p>
        </button>
      </div>

      {/* Feature Highlights */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-center gap-2">
          <Layers className="w-4 h-4 text-teal-500" />
          <span>No Direct State Mutation</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <GitCommit className="w-4 h-4 text-teal-500" />
          <span>Chronological Replay Engine</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-500" />
          <span>Forensic Audit Verifiability</span>
        </div>
      </div>

    </div>
  );
};

export default EmptyState;
