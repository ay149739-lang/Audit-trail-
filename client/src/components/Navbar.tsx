import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldAlert, Database, Server, Plus, ArrowRight } from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';
import { Logo } from './Logo';

interface NavbarProps {
  onOpenNewShipmentModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewShipmentModal }) => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, shipments, fetchShipmentById } = useShipmentStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = (searchQuery || '').trim();
    if (!query) return;

    const term = query.toUpperCase();
    fetchShipmentById(term);
    navigate(`/shipments/${term}`);
    setIsDropdownOpen(false);
  };

  const currentQuery = (searchQuery || '').trim();
  const filteredMatches = currentQuery
    ? shipments.filter(
        (s) =>
          s.aggregateId.toLowerCase().includes(currentQuery.toLowerCase()) ||
          s.origin.toLowerCase().includes(currentQuery.toLowerCase()) ||
          s.destination.toLowerCase().includes(currentQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-30 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left Title / Branding */}
        <Logo />

        {/* Search Bar connected to Backend */}
        <div className="flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search shipment ID (e.g. AT-2048)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
            />
          </form>

          {/* Quick Search Dropdown */}
          {isDropdownOpen && currentQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
              <div className="p-2 text-xs text-slate-400 border-b border-slate-800">
                Matching Aggregate IDs:
              </div>
              {filteredMatches.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  {filteredMatches.map((shipment) => (
                    <button
                      key={shipment.aggregateId}
                      onClick={() => {
                        fetchShipmentById(shipment.aggregateId);
                        navigate(`/shipments/${shipment.aggregateId}`);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800/80 flex items-center justify-between transition-colors text-xs border-b border-slate-800/50 last:border-0"
                    >
                      <div>
                        <div className="font-mono font-semibold text-teal-300">
                          {shipment.aggregateId}
                        </div>
                        <div className="text-slate-400">
                          {shipment.origin} → {shipment.destination}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px]">
                          v{shipment.latestVersion}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-xs text-slate-400 text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Enter</kbd> to query aggregate database for <span className="text-teal-400 font-mono">"{searchQuery}"</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions & Node Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewShipmentModal}
            className="hidden sm:flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-md shadow-teal-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Shipment</span>
          </button>

          <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>API Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
