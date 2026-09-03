import React from 'react';
import { Database, ShieldCheck, Server, Lock } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl font-mono">
      <div className="bg-[#0d1c2d] p-6 rounded border border-[#1c2b3c]">
        <h1 className="text-xl font-bold text-[#d4e4fa] font-sans">Architecture & CQRS Configuration</h1>
        <p className="text-xs text-[#8c909f] font-mono mt-1">
          System Environment Settings & Event Store Properties
        </p>
      </div>

      <div className="space-y-4">
        {/* CQRS Info Card */}
        <div className="bg-[#122131] p-6 rounded border border-[#1c2b3c] space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4d8eff]/10 rounded border border-[#4d8eff]/20 text-[#4d8eff]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#d4e4fa] text-sm font-sans">CQRS Command-Query Separation</h3>
              <p className="text-xs text-[#8c909f] font-mono">Backend Architecture Pattern</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono text-xs">
            <div className="bg-[#010f1f] p-4 rounded border border-[#1c2b3c] space-y-2">
              <div className="text-[#adc6ff] font-bold flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                <span>Command Responsibility</span>
              </div>
              <ul className="space-y-1 text-[#8c909f] text-[11px]">
                <li>• POST /api/shipments (Create)</li>
                <li>• POST /api/shipments/:id/move (Move)</li>
                <li>• POST /api/shipments/:id/events (Append)</li>
                <li className="text-[#10b981] mt-2 font-semibold">✓ Dispatches state mutation events</li>
              </ul>
            </div>

            <div className="bg-[#010f1f] p-4 rounded border border-[#1c2b3c] space-y-2">
              <div className="text-sky-400 font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Query Responsibility</span>
              </div>
              <ul className="space-y-1 text-[#8c909f] text-[11px]">
                <li>• GET /api/shipments (All Aggregates)</li>
                <li>• GET /api/shipments/:id (Aggregate Detail)</li>
                <li>• GET /api/shipments/:id/events (Raw Stream)</li>
                <li className="text-sky-400 mt-2 font-semibold">✓ Projects aggregate from events</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Store Enforcer Card */}
        <div className="bg-[#122131] p-6 rounded border border-[#1c2b3c] space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/15 rounded border border-amber-500/30 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#d4e4fa] text-sm font-sans">Append-Only Immutability Guard</h3>
              <p className="text-xs text-[#8c909f] font-mono">MongoDB Collection Rules</p>
            </div>
          </div>

          <p className="text-xs text-[#d4e4fa] leading-relaxed font-mono bg-[#010f1f] p-4 rounded border border-[#1c2b3c]">
            The Event Store collection enforces strict immutability. Pre-hooks on Mongoose model prevent updateOne, updateMany, deleteOne, or deleteMany calls. Historical audit logs cannot be altered.
          </p>
        </div>
      </div>
    </div>
  );
};
