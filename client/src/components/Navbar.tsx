import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowRight, Sun, Moon, Database, X } from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';
import { Logo } from './Logo';
import { PrimaryButton } from './PrimaryButton';

interface NavbarProps {
  onOpenNewShipmentModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewShipmentModal }) => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, shipments = [], fetchShipmentById } = useShipmentStore();
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dark Mode State (Defaults to Dark Mode as requested)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Global keyboard shortcut listener for Cmd+K / Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandModalOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isCommandModalOpen) {
        e.preventDefault();
        setIsCommandModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandModalOpen]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isCommandModalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    }
  }, [isCommandModalOpen]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const currentQuery = (searchQuery || '').trim();
  const safeShipments = Array.isArray(shipments) ? shipments : [];
  const filteredMatches = currentQuery
    ? safeShipments.filter(
      (s) =>
        s.aggregateId.toLowerCase().includes(currentQuery.toLowerCase()) ||
        s.origin.toLowerCase().includes(currentQuery.toLowerCase()) ||
        s.destination.toLowerCase().includes(currentQuery.toLowerCase()) ||
        (s.carrier || '').toLowerCase().includes(currentQuery.toLowerCase())
    )
    : safeShipments.slice(0, 5); // Show recent 5 if query is empty

  const handleSelectShipment = (aggregateId: string) => {
    const cleanId = aggregateId.toUpperCase();
    fetchShipmentById(cleanId);
    navigate(`/shipments/${cleanId}`);
    setIsCommandModalOpen(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredMatches.length > 0 && filteredMatches[selectedIndex]) {
      handleSelectShipment(filteredMatches[selectedIndex].aggregateId);
      return;
    }
    if (!currentQuery) return;
    handleSelectShipment(currentQuery);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredMatches.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredMatches.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredMatches.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + filteredMatches.length) % filteredMatches.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredMatches.length > 0 && filteredMatches[selectedIndex]) {
        handleSelectShipment(filteredMatches[selectedIndex].aggregateId);
      } else if (currentQuery) {
        handleSelectShipment(currentQuery);
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white dark:bg-[#1F1F1F] border-b border-[#DDDCD6] dark:border-[#333333] px-4 lg:px-8 py-3 shadow-sm transition-colors">
        <div className="flex items-center justify-between gap-4">
          {/* Left Title / Branding */}
          <Logo />

          {/* Compact Command Search Launcher (P0-1 Fix) */}
          <button
            type="button"
            onClick={() => setIsCommandModalOpen(true)}
            aria-label="Open global search (Ctrl+K or Cmd+K)"
            className="flex items-center justify-between gap-3 bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] hover:border-[#E56B2F] dark:hover:border-[#E5A93C] rounded-md px-3 py-1.5 text-xs text-[#4A4A45] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0] transition-all shadow-xs group w-44 sm:w-60 md:w-72"
          >
            <div className="flex items-center gap-2 truncate font-sans">
              <Search className="w-3.5 h-3.5 text-[#4A4A45] dark:text-[#9E9E98] group-hover:text-[#E56B2F] dark:group-hover:text-[#E5A93C] transition-colors shrink-0" />
              <span className="truncate">Global search...</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-[#7A7A75] dark:text-[#70706A] shrink-0">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#262626] border border-[#DDDCD6] dark:border-[#333333] group-hover:border-[#E56B2F]/40 dark:group-hover:border-[#E5A93C]/40">
                {isMac ? '⌘K' : 'Ctrl+K'}
              </kbd>
            </div>
          </button>

          {/* Right Actions, Theme Switcher & Node Status */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
              title={isDarkMode ? "Switch to Warm Industrial Light Mode" : "Switch to Premium Charcoal Dark Mode"}
              className="p-2 rounded-md bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] text-[#252525] dark:text-[#E5A93C] hover:border-[#E56B2F] dark:hover:border-[#E5A93C] transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none active:scale-[0.98]"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Standardized Primary Action Button */}
            <PrimaryButton
              icon={Plus}
              onClick={onOpenNewShipmentModal}
              className="hidden sm:inline-flex"
            >
              Dispatch Shipment
            </PrimaryButton>

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

      {/* Global Command Palette Modal (P0-1 Fix) */}
      {isCommandModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Global shipment command search"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 animate-fadeIn"
          onClick={() => setIsCommandModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-[#1F1F1F] border border-[#DDDCD6] dark:border-[#333333] rounded-lg shadow-2xl overflow-hidden font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative border-b border-[#DDDCD6] dark:border-[#333333]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A45] dark:text-[#9E9E98]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery || ''}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Type shipment aggregate ID (e.g. AT-2048), carrier, or route..."
                className="w-full pl-11 pr-10 py-3.5 bg-transparent text-sm text-[#252525] dark:text-[#F5F5F0] placeholder-[#4A4A45] dark:placeholder-[#9E9E98] focus:outline-none font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4A4A45] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Results Section */}
            <div className="p-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#4A4A45] dark:text-[#9E9E98] uppercase tracking-wider flex items-center justify-between">
                <span>{currentQuery ? 'Search Results' : 'Recent Active Aggregates'}</span>
                <span className="font-mono text-[10px]">{filteredMatches.length} available</span>
              </div>

              {filteredMatches.length > 0 ? (
                <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                  {filteredMatches.map((shipment, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={shipment.aggregateId}
                        onClick={() => handleSelectShipment(shipment.aggregateId)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`px-3 py-2.5 rounded-md cursor-pointer flex items-center justify-between transition-colors text-xs ${isSelected
                          ? 'bg-[#FAF9F5] dark:bg-[#262626] border-l-2 border-[#E56B2F] dark:border-[#E5A93C]'
                          : 'hover:bg-[#FAF9F5]/70 dark:hover:bg-[#262626]/60 border-l-2 border-transparent'
                          }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#E56B2F] dark:text-[#E5A93C] text-sm">
                              #{shipment.aggregateId}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold border font-mono ${shipment.status === 'WARNING'
                                ? 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30'
                                : shipment.status === 'DELIVERED'
                                  ? 'bg-[#3F8F6B]/10 text-[#3F8F6B] border-[#3F8F6B]/30'
                                  : 'bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 text-[#E56B2F] dark:text-[#E5A93C] border-[#E56B2F]/30 dark:border-[#E5A93C]/30'
                                }`}
                            >
                              {shipment.status}
                            </span>
                            <span className="text-[11px] text-[#4A4A45] dark:text-[#9E9E98] truncate">
                              {shipment.carrier}
                            </span>
                          </div>
                          <div className="text-[#4A4A45] dark:text-[#9E9E98] text-[11px] mt-0.5 truncate">
                            {shipment.origin} → {shipment.destination}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 ml-3">
                          <span className="bg-[#FAF9F5] dark:bg-[#141414] text-[#252525] dark:text-[#F5F5F0] px-2 py-0.5 rounded font-mono text-[10px] border border-[#DDDCD6] dark:border-[#333333]">
                            v{shipment.latestVersion || 1}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#4A4A45] dark:text-[#9E9E98]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[#4A4A45] dark:text-[#9E9E98] space-y-2">
                  <p className="font-semibold text-[#252525] dark:text-[#F5F5F0]">No shipments found</p>
                  <p className="text-[11px] font-mono">
                    Try another shipment ID or press <kbd className="px-1.5 py-0.5 bg-[#FAF9F5] dark:bg-[#262626] border border-[#DDDCD6] dark:border-[#333333] rounded">Enter</kbd> to query directly.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Keyboard Shortcut Hints */}
            <div className="p-2.5 bg-[#FAF9F5] dark:bg-[#141414] border-t border-[#DDDCD6] dark:border-[#333333] flex items-center justify-between text-[11px] text-[#7A7A75] dark:text-[#70706A] font-mono">
              <div className="flex items-center gap-3">
                <span><kbd className="px-1 py-0.5 rounded bg-white dark:bg-[#262626] border border-[#DDDCD6] dark:border-[#333333]">↑↓</kbd> navigate</span>
                <span><kbd className="px-1 py-0.5 rounded bg-white dark:bg-[#262626] border border-[#DDDCD6] dark:border-[#333333]">↵</kbd> select</span>
              </div>
              <span><kbd className="px-1 py-0.5 rounded bg-white dark:bg-[#262626] border border-[#DDDCD6] dark:border-[#333333]">esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
