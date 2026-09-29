import React, { useState } from 'react';
import { Database, ShieldCheck, Server, Lock, Cpu, CheckCircle2, RefreshCw } from 'lucide-react';
import { SecondaryButton } from '../components/SecondaryButton';

export const SettingsPage: React.FC = () => {
  const [workerFrequency, setWorkerFrequency] = useState('1000');
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    localStorage.removeItem('theme');
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl font-sans transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#252525] dark:text-[#F5F5F0] tracking-tight font-sans">
              System Configuration &amp; Event Store Specs
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#3F8F6B]/10 text-[#3F8F6B] border border-[#3F8F6B]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3F8F6B]" />
              Projections Connected
            </span>
          </div>
          <p className="text-xs text-[#4A4A45] dark:text-[#9E9E98] font-sans mt-1">
            CQRS engine execution parameters, immutability guard rules, and worker telemetry
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CQRS Command/Query Separation Spec */}
        <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-3">
            <div className="p-2 bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 rounded-md border border-[#E56B2F]/20 dark:border-[#E5A93C]/20 text-[#E56B2F] dark:text-[#E5A93C]">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm">
                Command-Query Responsibility Segregation
              </h3>
              <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] font-mono">
                Decoupled Write Mutations &amp; Read Projections
              </p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-[#FAF9F5] dark:bg-[#141414] p-3.5 rounded-md border border-[#DDDCD6] dark:border-[#333333] space-y-1.5">
              <div className="flex items-center justify-between text-[#E56B2F] dark:text-[#E5A93C] font-bold text-[11px]">
                <span>COMMAND SIDE (WRITES)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E56B2F]/15 dark:bg-[#E5A93C]/15">APPEND ONLY</span>
              </div>
              <ul className="space-y-1 text-[#6B6B66] dark:text-[#9E9E98] text-[11px]">
                <li><code className="text-[#252525] dark:text-[#F5F5F0]">POST /api/shipments</code> (Create Aggregate)</li>
                <li><code className="text-[#252525] dark:text-[#F5F5F0]">POST /api/shipments/:id/move</code> (Location Command)</li>
                <li><code className="text-[#252525] dark:text-[#F5F5F0]">POST /api/shipments/:id/events</code> (Append Telemetry)</li>
              </ul>
            </div>

            <div className="bg-[#FAF9F5] dark:bg-[#141414] p-3.5 rounded-md border border-[#DDDCD6] dark:border-[#333333] space-y-1.5">
              <div className="flex items-center justify-between text-[#3A8B88] font-bold text-[11px]">
                <span>QUERY SIDE (PROJECTIONS)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#3A8B88]/15">READ MODEL</span>
              </div>
              <ul className="space-y-1 text-[#6B6B66] dark:text-[#9E9E98] text-[11px]">
                <li><code className="text-[#252525] dark:text-[#F5F5F0]">GET /api/shipments</code> (All Projected Aggregates)</li>
                <li><code className="text-[#252525] dark:text-[#F5F5F0]">GET /api/shipments/:id</code> (Aggregated Read State)</li>
                <li><code className="text-[#252525] dark:text-[#F5F5F0]">GET /api/shipments/:id/state-at/:v</code> (Time Rewind)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Projection Worker Configuration */}
        <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-3">
            <div className="p-2 bg-[#3A8B88]/10 rounded-md border border-[#3A8B88]/20 text-[#3A8B88]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm">
                Background Projection Engine
              </h3>
              <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] font-mono">
                Catch-Up Subscription Worker
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <div className="flex items-center justify-between p-3 bg-[#FAF9F5] dark:bg-[#141414] rounded-md border border-[#DDDCD6] dark:border-[#333333]">
              <div>
                <span className="font-semibold text-[#252525] dark:text-[#F5F5F0] block">Worker Status</span>
                <span className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98]">Continuously projecting immutable events</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#3F8F6B]">
                <CheckCircle2 className="w-4 h-4" />
                ACTIVE
              </span>
            </div>

            <div className="p-3 bg-[#FAF9F5] dark:bg-[#141414] rounded-md border border-[#DDDCD6] dark:border-[#333333] space-y-2">
              <label className="font-semibold text-[#252525] dark:text-[#F5F5F0] block">
                Worker Catch-Up Interval
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={workerFrequency}
                  onChange={(e) => setWorkerFrequency(e.target.value)}
                  className="bg-white dark:bg-[#1F1F1F] border border-[#DDDCD6] dark:border-[#333333] rounded px-3 py-1.5 text-xs text-[#252525] dark:text-[#F5F5F0] font-mono focus:outline-none focus:border-[#E56B2F] dark:focus:border-[#E5A93C]"
                >
                  <option value="500">500 ms (Near Real-time)</option>
                  <option value="1000">1,000 ms (Standard Production)</option>
                  <option value="5000">5,000 ms (Resource Constrained)</option>
                </select>
                <span className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] font-mono">Current: {workerFrequency}ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Append-Only Immutability Guard */}
        <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-3">
            <div className="p-2 bg-[#3F8F6B]/10 rounded-md border border-[#3F8F6B]/20 text-[#3F8F6B]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm">
                Append-Only Immutability Guard
              </h3>
              <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] font-mono">
                Mongoose ORM Security Hooks
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-[#FAF9F5] dark:bg-[#141414] rounded-md border border-[#DDDCD6] dark:border-[#333333] text-xs font-mono space-y-2 text-[#4A4A45] dark:text-[#9E9E98]">
            <p className="leading-relaxed">
              The MongoDB Event Store enforces database-level immutability. Pre-hooks block:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-[#C94A4A]">
              <div className="bg-[#C94A4A]/10 p-2 rounded border border-[#C94A4A]/25">✕ updateOne / updateMany</div>
              <div className="bg-[#C94A4A]/10 p-2 rounded border border-[#C94A4A]/25">✕ deleteOne / deleteMany</div>
              <div className="bg-[#C94A4A]/10 p-2 rounded border border-[#C94A4A]/25">✕ findOneAndUpdate</div>
              <div className="bg-[#C94A4A]/10 p-2 rounded border border-[#C94A4A]/25">✕ findOneAndDelete</div>
            </div>
          </div>
        </div>

        {/* Client Diagnostics & Cache Controls */}
        <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-3">
            <div className="p-2 bg-[#D9A441]/10 rounded-md border border-[#D9A441]/20 text-[#D9A441]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm">
                Client Diagnostics &amp; Cache
              </h3>
              <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] font-mono">
                Local Environment Storage
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <div className="p-3 bg-[#FAF9F5] dark:bg-[#141414] rounded-md border border-[#DDDCD6] dark:border-[#333333] space-y-1">
              <span className="font-semibold text-[#252525] dark:text-[#F5F5F0] block">API Gateway Endpoint</span>
              <span className="font-mono text-[11px] text-[#6B6B66] dark:text-[#9E9E98] block">http://localhost:5000/api</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="font-semibold text-[#252525] dark:text-[#F5F5F0] block">Reset UI Preferences</span>
                <span className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98]">Clears cached theme and local filters</span>
              </div>
              <SecondaryButton
                onClick={handleClearCache}
                icon={RefreshCw}
              >
                {cacheCleared ? 'Cleared ✓' : 'Reset Preferences'}
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
