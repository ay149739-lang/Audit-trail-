import React from 'react';
import { Database, ShieldCheck, Server, Lock } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl font-mono">
      <div className="bg-white p-6 rounded-md border border-[#DDDCD6] shadow-sm">
        <h1 className="text-xl font-bold text-[#252525] font-sans">Architecture & CQRS Configuration</h1>
        <p className="text-xs text-[#6B6B66] font-mono mt-1">
          System Environment Settings & Event Store Properties
        </p>
      </div>

      <div className="space-y-4">
        {/* CQRS Info Card */}
        <div className="bg-white p-6 rounded-md border border-[#DDDCD6] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E56B2F]/10 rounded-md border border-[#E56B2F]/20 text-[#E56B2F]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#252525] text-sm font-sans">CQRS Command-Query Separation</h3>
              <p className="text-xs text-[#6B6B66] font-mono">Backend Architecture Pattern</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono text-xs">
            <div className="bg-[#FAF9F5] p-4 rounded-md border border-[#DDDCD6] space-y-2">
              <div className="text-[#E56B2F] font-bold flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                <span>Command Responsibility</span>
              </div>
              <ul className="space-y-1 text-[#6B6B66] text-[11px]">
                <li>• POST /api/shipments (Create)</li>
                <li>• POST /api/shipments/:id/move (Move)</li>
                <li>• POST /api/shipments/:id/events (Append)</li>
                <li className="text-[#3F8F6B] mt-2 font-semibold">✓ Dispatches state mutation events</li>
              </ul>
            </div>

            <div className="bg-[#FAF9F5] p-4 rounded-md border border-[#DDDCD6] space-y-2">
              <div className="text-[#D9A441] font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Query Responsibility</span>
              </div>
              <ul className="space-y-1 text-[#6B6B66] text-[11px]">
                <li>• GET /api/shipments (All Aggregates)</li>
                <li>• GET /api/shipments/:id (Aggregate Detail)</li>
                <li>• GET /api/shipments/:id/events (Raw Stream)</li>
                <li className="text-[#D9A441] mt-2 font-semibold">✓ Projects aggregate from events</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Store Enforcer Card */}
        <div className="bg-white p-6 rounded-md border border-[#DDDCD6] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3F8F6B]/10 rounded-md border border-[#3F8F6B]/20 text-[#3F8F6B]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#252525] text-sm font-sans">Append-Only Immutability Guard</h3>
              <p className="text-xs text-[#6B6B66] font-mono">MongoDB Collection Rules</p>
            </div>
          </div>

          <p className="text-xs text-[#252525] leading-relaxed font-mono bg-[#FAF9F5] p-4 rounded-md border border-[#DDDCD6]">
            The Event Store collection enforces strict immutability. Pre-hooks on Mongoose model prevent updateOne, updateMany, deleteOne, or deleteMany calls. Historical audit logs cannot be altered.
          </p>
        </div>
      </div>
    </div>
  );
};
