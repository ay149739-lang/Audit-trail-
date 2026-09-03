import React from 'react';
import { Settings, Database, ShieldCheck, Server, Lock, Cpu } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-bold text-slate-100">Architecture & CQRS Configuration</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          System Environment Settings & Event Store Properties
        </p>
      </div>

      <div className="space-y-4">
        {/* CQRS Info Card */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">CQRS Command-Query Separation</h3>
              <p className="text-xs text-slate-400 font-mono">Backend Architecture Pattern</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-teal-400 font-bold flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                <span>Command Responsibility</span>
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>• POST /api/shipments (Create)</li>
                <li>• POST /api/shipments/:id/move (Move)</li>
                <li>• POST /api/shipments/:id/events (Append)</li>
                <li className="text-emerald-400 mt-2 font-semibold">✓ Dispatches state mutation events</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-sky-400 font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Query Responsibility</span>
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>• GET /api/shipments (All Aggregates)</li>
                <li>• GET /api/shipments/:id (Aggregate Detail)</li>
                <li>• GET /api/shipments/:id/events (Raw Stream)</li>
                <li className="text-sky-400 mt-2 font-semibold">✓ Projects aggregate from events</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Store Enforcer Card */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/15 rounded-xl border border-amber-500/30 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Append-Only Immutability Guard</h3>
              <p className="text-xs text-slate-400 font-mono">MongoDB Collection Rules</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
            The Event Store collection enforces strict immutability. Pre-hooks on Mongoose model prevent updateOne, updateMany, deleteOne, or deleteMany calls. Historical audit logs cannot be altered.
          </p>
        </div>
      </div>
    </div>
  );
};
