import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, BarChart3, Settings, ShieldCheck, Database, Lock } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Shipments', path: '/shipments', icon: Truck },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-[#0d1c2d] border-r border-[#1c2b3c] flex flex-col justify-between hidden md:flex shrink-0">
      <div className="p-4 space-y-6">
        {/* CQRS Navigation Menu */}
        <div>
          <div className="text-[11px] font-semibold text-[#8c909f] uppercase tracking-wider px-3 mb-2 font-mono">
            Audit Ledger Nav
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold font-sans transition-all ${
                      isActive
                        ? 'bg-[#1c2b3c] text-[#4d8eff] border border-[#273647] shadow-sm'
                        : 'text-[#8c909f] hover:text-[#d4e4fa] hover:bg-[#122131]'
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

        {/* Stitch Architecture Enforcer Box */}
        <div className="bg-[#010f1f] border border-[#1c2b3c] rounded p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#d4e4fa]">
            <Lock className="w-3.5 h-3.5 text-[#4d8eff]" />
            <span className="font-mono">Append-Only Store</span>
          </div>
          <p className="text-[11px] text-[#8c909f] leading-relaxed font-sans">
            Events are permanent & immutable. Updates or deletions are strictly prohibited.
          </p>
          <div className="pt-2 border-t border-[#1c2b3c] flex items-center justify-between text-[10px] text-[#8c909f] font-mono">
            <span>CQRS Engine</span>
            <span className="text-[#10b981] font-semibold">Active</span>
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#1c2b3c] text-xs text-[#8c909f] font-mono flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Database className="w-3.5 h-3.5 text-[#4d8eff]" />
          <span>MongoDB EventStore</span>
        </div>
        <span className="text-[#adc6ff] text-[10px]">v1.0</span>
      </div>
    </aside>
  );
};
