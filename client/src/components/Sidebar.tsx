import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, BarChart3, Settings, ShieldCheck, Database } from 'lucide-react';
import { TechTerm } from './TechTerm';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Shipments', path: '/shipments', icon: Truck },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#1F1F1F] border-r border-[#DDDCD6] dark:border-[#333333] flex flex-col justify-between hidden md:flex shrink-0 transition-colors">
      <div className="p-4 space-y-6">
        {/* CQRS Navigation Menu */}
        <div>
          <div className="text-[11px] font-semibold text-[#4A4A45] dark:text-[#9E9E98] uppercase tracking-wider px-3 mb-2 font-sans">
            Platform Navigation
          </div>
          <nav aria-label="Platform navigation" className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none font-sans ${isActive
                      ? 'bg-[#FAF9F5] dark:bg-[#262626] text-[#E56B2F] dark:text-[#E5A93C] border border-[#E56B2F]/30 dark:border-[#E5A93C]/40 shadow-xs font-bold'
                      : 'text-[#4A4A45] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0] hover:bg-[#FAF9F5] dark:hover:bg-[#262626]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Operational Telemetry Card */}
        <div className="bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#252525] dark:text-[#F5F5F0] font-sans">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E56B2F] dark:text-[#E5A93C]" />
              <span>Event Store Ledger</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#3F8F6B] animate-pulse" title="Ledger Active & Connected" />
          </div>
          <div className="space-y-1.5 text-[11px] text-[#4A4A45] dark:text-[#9E9E98] font-mono">
            <div className="flex items-center justify-between">
              <span>Write Mode:</span>
              <span className="text-[#252525] dark:text-[#F5F5F0] font-semibold">Append-Only</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Projections:</span>
              <span className="text-[#3F8F6B] font-semibold">Live Synced</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Engine:</span>
              <span className="text-[#252525] dark:text-[#F5F5F0] font-semibold">CQRS Core</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Meta */}
      <div className="p-4 border-t border-[#DDDCD6] dark:border-[#333333] text-xs text-[#4A4A45] dark:text-[#9E9E98] font-mono flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-[#E56B2F] dark:text-[#E5A93C]" />
          <span>Mongo EventStore</span>
        </div>
        <span className="text-[#E56B2F] dark:text-[#E5A93C] font-bold">v1.0.0</span>
      </div>
    </aside>
  );
};
