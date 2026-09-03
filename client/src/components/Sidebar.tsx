import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, GitCommit, BarChart3, Settings, ShieldCheck, Database } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Shipments', path: '/shipments', icon: Truck },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="p-4 space-y-6">
        {/* CQRS Navigation Menu */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 font-mono">
            Platform Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* CQRS Architecture Badge */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Event Store Enforcer</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Historical events are immutable & append-only. Updates/Deletions are forbidden.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Pattern: CQRS</span>
            <span>Ver: 2.0</span>
          </div>
        </div>
      </div>

      {/* Footer System Meta */}
      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-500 font-mono flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span>Mongo EventStore</span>
        </div>
        <span className="text-teal-500">v1.0.0</span>
      </div>
    </aside>
  );
};
