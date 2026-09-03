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
    <header className="sticky top-0 z-30 bg-[#0d1c2d]/95 backdrop-blur-md border-b border-[#1c2b3c] px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left Title / Branding */}
        <Logo />

        {/* Search Bar connected to CQRS Backend */}
        <div className="flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c909f]" />
            <input
              type="text"
              placeholder="Search shipment ID (e.g. AT-2048)..."
              value={searchQuery || ''}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full bg-[#010f1f] border border-[#273647] rounded pl-9 pr-4 py-2 text-sm text-[#d4e4fa] placeholder-[#8c909f] focus:outline-none focus:border-[#4d8eff] focus:ring-1 focus:ring-[#4d8eff]/30 transition-all font-mono"
            />
          </form>

          {/* Quick Search Dropdown */}
          {isDropdownOpen && currentQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0d1c2d] border border-[#273647] rounded shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-2.5 text-[11px] text-[#8c909f] font-mono border-b border-[#1c2b3c]">
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
                      className="w-full text-left px-3 py-2.5 hover:bg-[#1c2b3c] flex items-center justify-between transition-colors text-xs border-b border-[#1c2b3c]/60 last:border-0"
                    >
                      <div>
                        <div className="font-mono font-bold text-[#adc6ff]">
                          {shipment.aggregateId}
                        </div>
                        <div className="text-[#8c909f] text-[11px]">
                          {shipment.origin} → {shipment.destination}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#010f1f] text-[#bec6e0] px-2 py-0.5 rounded font-mono text-[10px] border border-[#273647]">
                          v{shipment.latestVersion || 1}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8c909f]" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-xs text-[#8c909f] font-mono text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-[#010f1f] border border-[#273647] rounded text-[#d4e4fa]">Enter</kbd> to query aggregate store for <span className="text-[#4d8eff] font-mono">"{currentQuery}"</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewShipmentModal}
            className="hidden sm:flex items-center gap-2 bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold px-3.5 py-1.5 rounded text-xs transition-all shadow-md font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Shipment</span>
          </button>

          <div className="hidden md:flex items-center gap-2 bg-[#010f1f] border border-[#273647] px-3 py-1.5 rounded text-xs text-[#d4e4fa] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span>Ledger Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
