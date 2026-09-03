import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, BarChart3, Settings, ShieldCheck, Database } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Shipments', path: '/shipments', icon: Truck },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#DDDCD6] flex flex-col justify-between hidden md:flex shrink-0">
      <div className="p-4 space-y-6">
        {/* CQRS Navigation Menu */}
        <div>
          <div className="text-[11px] font-semibold text-[#6B6B66] uppercase tracking-wider px-3 mb-2 font-mono">
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
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#FAF9F5] text-[#E56B2F] border border-[#E56B2F]/30 shadow-sm'
                        : 'text-[#6B6B66] hover:text-[#252525] hover:bg-[#FAF9F5]'
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
        <div className="bg-[#FAF9F5] border border-[#DDDCD6] rounded-md p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#252525]">
            <ShieldCheck className="w-4 h-4 text-[#E56B2F]" />
            <span>Event Store Enforcer</span>
          </div>
          <p className="text-[11px] text-[#6B6B66] leading-relaxed">
            Historical events are immutable & append-only. Updates/Deletions are forbidden.
          </p>
          <div className="pt-2 border-t border-[#DDDCD6] flex items-center justify-between text-[10px] text-[#6B6B66] font-mono">
            <span>Pattern: CQRS</span>
            <span>Ver: 2.0</span>
          </div>
        </div>
      </div>

      {/* Footer System Meta */}
      <div className="p-4 border-t border-[#DDDCD6] text-xs text-[#6B6B66] font-mono flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-[#E56B2F]" />
          <span>Mongo EventStore</span>
        </div>
        <span className="text-[#E56B2F] font-bold">v1.0.0</span>
      </div>
    </aside>
  );
};
