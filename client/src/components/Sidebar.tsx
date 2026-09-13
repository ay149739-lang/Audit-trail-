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
          <div className="text-[11px] font-semibold text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider px-3 mb-2 font-mono">
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
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none ${
                      isActive
                        ? 'bg-[#FAF9F5] dark:bg-[#262626] text-[#E56B2F] dark:text-[#E5A93C] border border-[#E56B2F]/30 dark:border-[#E5A93C]/40 shadow-sm font-bold'
                        : 'text-[#6B6B66] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0] hover:bg-[#FAF9F5] dark:hover:bg-[#262626]'
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
        <div className="bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#252525] dark:text-[#F5F5F0]">
            <ShieldCheck className="w-4 h-4 text-[#E56B2F] dark:text-[#E5A93C]" />
            <span>Event Store Enforcer</span>
          </div>
          <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] leading-relaxed">
            Historical events are immutable & append-only. Updates/Deletions are forbidden.
          </p>
          <div className="pt-2 border-t border-[#DDDCD6] dark:border-[#333333] flex items-center justify-between text-[10px] text-[#6B6B66] dark:text-[#9E9E98] font-mono">
            <span>
              Pattern:{' '}
              <TechTerm
                term="CQRS"
                definition="Command Query Responsibility Segregation separates write mutations from read query projections."
              />
            </span>
            <span>Ver: 2.0</span>
          </div>
        </div>
      </div>

      {/* Footer System Meta */}
      <div className="p-4 border-t border-[#DDDCD6] dark:border-[#333333] text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-[#E56B2F] dark:text-[#E5A93C]" />
          <span>Mongo EventStore</span>
        </div>
        <span className="text-[#E56B2F] dark:text-[#E5A93C] font-bold">v1.0.0</span>
      </div>
    </aside>
  );
};
