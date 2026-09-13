import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowRight, Sun, Moon, Database } from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';
import { Logo } from './Logo';

interface NavbarProps {
  onOpenNewShipmentModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewShipmentModal }) => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, shipments = [], fetchShipmentById } = useShipmentStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Dark Mode State (Defaults to Dark Mode as requested)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

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
    <header className="sticky top-0 z-30 bg-white dark:bg-[#1F1F1F] border-b border-[#DDDCD6] dark:border-[#333333] px-4 lg:px-8 py-3 shadow-sm transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left Title / Branding */}
        <Logo />

        {/* Search Bar connected to Backend */}
        <div className="flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66] dark:text-[#9E9E98]" />
            <input
              id="global-shipment-search"
              type="text"
              aria-label="Search shipment aggregate ID"
              placeholder="Search shipment ID (e.g. AT-2048)..."
              value={searchQuery || ''}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md pl-9 pr-4 py-2 text-xs text-[#252525] dark:text-[#F5F5F0] placeholder-[#6B6B66] dark:placeholder-[#9E9E98] focus:outline-none focus:border-[#E56B2F] dark:focus:border-[#E5A93C] focus:ring-1 focus:ring-[#E56B2F]/30 dark:focus:ring-[#E5A93C]/30 transition-all font-mono"
            />
          </form>

          {/* Quick Search Dropdown */}
          {isDropdownOpen && currentQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1F1F1F] border border-[#DDDCD6] dark:border-[#333333] rounded-md shadow-lg overflow-hidden z-50 animate-fadeIn">
              <div className="p-2.5 text-[11px] text-[#6B6B66] dark:text-[#9E9E98] font-mono border-b border-[#DDDCD6] dark:border-[#333333] flex items-center justify-between">
                <span>Matching Aggregate IDs</span>
                <span className="text-[10px]">{filteredMatches.length} match(es)</span>
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
                      className="w-full text-left px-3 py-2.5 hover:bg-[#FAF9F5] dark:hover:bg-[#262626] flex items-center justify-between transition-colors text-xs border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 last:border-0"
                    >
                      <div>
                        <div className="font-mono font-bold text-[#E56B2F] dark:text-[#E5A93C]">
                          {shipment.aggregateId}
                        </div>
                        <div className="text-[#6B6B66] dark:text-[#9E9E98] text-[11px]">
                          {shipment.origin} → {shipment.destination}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#FAF9F5] dark:bg-[#262626] text-[#252525] dark:text-[#F5F5F0] px-2 py-0.5 rounded font-mono text-[10px] border border-[#DDDCD6] dark:border-[#333333]">
                          v{shipment.latestVersion || 1}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#6B6B66] dark:text-[#9E9E98]" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono text-center space-y-1">
                  <div>No direct matches found.</div>
                  <div className="text-[11px]">
                    Press <kbd className="px-1.5 py-0.5 bg-[#FAF9F5] dark:bg-[#262626] border border-[#DDDCD6] dark:border-[#333333] rounded text-[#252525] dark:text-[#F5F5F0]">Enter</kbd> to query aggregate database for <span className="text-[#E56B2F] dark:text-[#E5A93C] font-mono">"{currentQuery}"</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions, Theme Switcher & Node Status */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
            title={isDarkMode ? "Switch to Warm Industrial Light Mode" : "Switch to Premium Charcoal Dark Mode"}
            className="p-2 rounded-md bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] text-[#252525] dark:text-[#E5A93C] hover:border-[#E56B2F] dark:hover:border-[#E5A93C] transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Standardized Primary Action Button */}
          <button
            onClick={onOpenNewShipmentModal}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#E56B2F] hover:bg-[#D45A1E] dark:bg-[#E5A93C] dark:hover:bg-[#D49A2A] text-white dark:text-[#141414] px-3.5 py-2 rounded-md text-xs font-bold font-mono transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Shipment</span>
          </button>

          {/* Status Indicator */}
          <div
            title="Append-only Event Store and Read Model projections are connected"
            className="hidden md:flex items-center gap-2 bg-[#FAF9F5] dark:bg-[#262626] border border-[#DDDCD6] dark:border-[#333333] px-3 py-2 rounded-md text-xs text-[#252525] dark:text-[#F5F5F0] font-mono cursor-default"
          >
            <span className="w-2 h-2 rounded-full bg-[#3F8F6B] dark:bg-[#3A8B88] animate-pulse"></span>
            <span>API Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
