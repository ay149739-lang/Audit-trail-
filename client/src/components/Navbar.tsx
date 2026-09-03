import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowRight, Activity } from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';
import { Logo } from './Logo';

interface NavbarProps {
  onOpenNewShipmentModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewShipmentModal }) => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, shipments = [], fetchShipmentById } = useShipmentStore();
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
  const safeShipments = Array.isArray(shipments) ? shipments : [];
  const filteredMatches = currentQuery
    ? safeShipments.filter(
        (s) =>
          s.aggregateId.toLowerCase().includes(currentQuery.toLowerCase()) ||
          s.origin.toLowerCase().includes(currentQuery.toLowerCase()) ||
          s.destination.toLowerCase().includes(currentQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#DDDCD6] px-4 lg:px-8 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left Title / Branding */}
        <Logo />

        {/* Search Bar connected to Backend */}
        <div className="flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
            <input
              type="text"
              placeholder="Search shipment ID (e.g. AT-2048)..."
              value={searchQuery || ''}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full bg-[#FAF9F5] border border-[#DDDCD6] rounded-md pl-9 pr-4 py-2 text-sm text-[#252525] placeholder-[#6B6B66] focus:outline-none focus:border-[#E56B2F] focus:ring-1 focus:ring-[#E56B2F]/30 transition-all font-mono"
            />
          </form>

          {/* Quick Search Dropdown */}
          {isDropdownOpen && currentQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#DDDCD6] rounded-md shadow-lg overflow-hidden z-50 animate-fadeIn">
              <div className="p-2.5 text-[11px] text-[#6B6B66] font-mono border-b border-[#DDDCD6]">
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
                      className="w-full text-left px-3 py-2.5 hover:bg-[#FAF9F5] flex items-center justify-between transition-colors text-xs border-b border-[#DDDCD6]/60 last:border-0"
                    >
                      <div>
                        <div className="font-mono font-bold text-[#E56B2F]">
                          {shipment.aggregateId}
                        </div>
                        <div className="text-[#6B6B66] text-[11px]">
                          {shipment.origin} → {shipment.destination}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#FAF9F5] text-[#252525] px-2 py-0.5 rounded font-mono text-[10px] border border-[#DDDCD6]">
                          v{shipment.latestVersion || 1}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#6B6B66]" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-xs text-[#6B6B66] font-mono text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-[#FAF9F5] border border-[#DDDCD6] rounded text-[#252525]">Enter</kbd> to query aggregate database for <span className="text-[#E56B2F] font-mono">"{currentQuery}"</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions & Node Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewShipmentModal}
            className="hidden sm:flex items-center gap-2 bg-[#E56B2F] hover:bg-[#D45A1E] text-white px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs font-sans"
          >
            <Plus className="w-4 h-4" />
            <span>New Shipment</span>
          </button>

          <div className="hidden md:flex items-center gap-2 bg-[#FAF9F5] border border-[#DDDCD6] px-3 py-1.5 rounded-md text-xs text-[#252525] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#3F8F6B]"></span>
            <span>API Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
