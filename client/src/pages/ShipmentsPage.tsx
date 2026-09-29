import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  Plus,
  ArrowRight,
  ThermometerSnowflake,
  X,
  RotateCcw,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';
import { TechTerm } from '../components/TechTerm';
import { PrimaryButton } from '../components/PrimaryButton';

interface ShipmentsPageProps {
  onOpenNewShipmentModal: () => void;
}

export const ShipmentsPage: React.FC<ShipmentsPageProps> = ({ onOpenNewShipmentModal }) => {
  const navigate = useNavigate();
  const { shipments = [], fetchShipments, isLoading, error } = useShipmentStore();
  const [filter, setFilter] = useState<string>('ALL');
  const [localQuery, setLocalQuery] = useState<string>('');

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const safeShipments = Array.isArray(shipments) ? shipments : [];

  const inTransitCount = safeShipments.filter((s) => s?.status === 'IN_TRANSIT').length;
  const atPortCount = safeShipments.filter(
    (s) => s?.status === 'AT_PORT' || s?.status === 'CUSTOMS_CLEARED'
  ).length;
  const warningCount = safeShipments.filter((s) => s?.status === 'WARNING').length;
  const deliveredCount = safeShipments.filter((s) => s?.status === 'DELIVERED').length;

  const filteredShipments = safeShipments.filter((s) => {
    const matchesFilter =
      filter === 'ALL'
        ? true
        : filter === 'WARNING'
          ? s?.status === 'WARNING'
          : filter === 'IN_TRANSIT'
            ? s?.status === 'IN_TRANSIT'
            : filter === 'AT_PORT'
              ? s?.status === 'AT_PORT' || s?.status === 'CUSTOMS_CLEARED'
              : filter === 'DELIVERED'
                ? s?.status === 'DELIVERED'
                : true;

    const q = localQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (s?.aggregateId || '').toLowerCase().includes(q) ||
      (s?.origin || '').toLowerCase().includes(q) ||
      (s?.destination || '').toLowerCase().includes(q) ||
      (s?.currentLocation || '').toLowerCase().includes(q) ||
      (s?.carrier || '').toLowerCase().includes(q);

    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fadeIn transition-colors font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#1F1F1F] p-5 rounded-lg border border-[#DDDCD6] dark:border-[#333333] shadow-elev-1">
        <div>
          <h1 className="text-xl font-bold text-[#252525] dark:text-[#F5F5F0] tracking-tight font-sans">
            Shipment Fleet &amp; Custody Ledger
          </h1>
          <p className="text-xs text-[#4A4A45] dark:text-[#9E9E98] font-sans mt-1">
            Active chain-of-custody records, port clearance status, and route telemetry
          </p>
        </div>

        {/* Standardized Primary Action Button */}
        <PrimaryButton icon={Plus} onClick={onOpenNewShipmentModal}>
          Dispatch Shipment
        </PrimaryButton>
      </div>

      {/* Error Banner with In-Place Retry */}
      {error && (
        <div className="p-3 bg-[#C94A4A]/10 border border-[#C94A4A]/30 text-[#C94A4A] rounded-md text-xs font-sans flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C94A4A] shrink-0" />
            <span>Unable to load shipments: {error}</span>
          </div>
          <button
            onClick={() => fetchShipments()}
            className="bg-[#C94A4A] hover:bg-[#B03A3A] text-white px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 focus-visible:ring-1 focus-visible:ring-[#C94A4A] focus:outline-none font-sans"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Unified Enterprise Filter & Search Toolbar (P1-1 Spacing: p-4) */}
      <div className="bg-white dark:bg-[#1F1F1F] p-4 rounded-lg border border-[#DDDCD6] dark:border-[#333333] shadow-elev-1 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Segmented Control */}
        <div className="flex flex-wrap items-center gap-1 bg-[#FAF9F5] dark:bg-[#141414] p-1 rounded border border-[#DDDCD6] dark:border-[#333333] text-xs font-sans">
          {[
            { key: 'ALL', label: 'All', count: safeShipments.length },
            { key: 'IN_TRANSIT', label: 'In Transit', count: inTransitCount },
            { key: 'AT_PORT', label: 'At Port', count: atPortCount },
            { key: 'WARNING', label: 'Warning', count: warningCount },
            { key: 'DELIVERED', label: 'Delivered', count: deliveredCount },
          ].map((item) => {
            const isSelected = filter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none text-[11px] ${isSelected
                    ? 'bg-white dark:bg-[#262626] text-[#E56B2F] dark:text-[#E5A93C] font-bold border border-[#DDDCD6] dark:border-[#444444] shadow-xs'
                    : 'text-[#4A4A45] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0]'
                  }`}
              >
                <span>{item.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected
                      ? 'bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 text-[#E56B2F] dark:text-[#E5A93C] font-bold'
                      : 'bg-black/5 dark:bg-white/5 text-[#7A7A75] dark:text-[#70706A]'
                    }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Integrated Inline Table Search (Preserved as Primary Table Filter) */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A45] dark:text-[#9E9E98]" />
          <input
            type="text"
            aria-label="Filter shipments directory table"
            placeholder="Filter ID, route, carrier... (Esc to clear)"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setLocalQuery('');
                e.currentTarget.blur();
              }
            }}
            className="w-full bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded pl-9 pr-8 py-1.5 text-xs text-[#252525] dark:text-[#F5F5F0] placeholder-[#4A4A45] dark:placeholder-[#9E9E98] focus:outline-none focus:border-[#E56B2F] dark:focus:border-[#E5A93C] font-sans shadow-xs"
          />
          {localQuery && (
            <button
              onClick={() => setLocalQuery('')}
              title="Clear search (Esc)"
              aria-label="Clear filter query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4A4A45] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Shipments Grid / Table */}
      <div className="bg-white dark:bg-[#1F1F1F] rounded-lg border border-[#DDDCD6] dark:border-[#333333] shadow-elev-1 overflow-hidden">
        {isLoading && safeShipments.length === 0 ? (
          /* Zero-jump table skeleton loader matching exact column layout */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#FAF9F5] dark:bg-[#141414] text-[#4A4A45] dark:text-[#9E9E98] uppercase tracking-wider border-b border-[#DDDCD6] dark:border-[#333333] text-[11px] font-sans">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Shipment ID</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Carrier & Vessel</th>
                  <th className="py-3.5 px-4 font-semibold">Origin → Destination</th>
                  <th className="py-3.5 px-4 font-semibold">Current Location</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Telemetry</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Events</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Version</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDDCD6]/60 dark:divide-[#333333]/60">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 w-20 bg-[#FAF9F5] dark:bg-[#262626] rounded"></div></td>
                    <td className="py-4 px-4"><div className="h-4 w-16 bg-[#FAF9F5] dark:bg-[#262626] rounded"></div></td>
                    <td className="py-4 px-4"><div className="h-4 w-28 bg-[#FAF9F5] dark:bg-[#262626] rounded"></div></td>
                    <td className="py-4 px-4"><div className="h-4 w-32 bg-[#FAF9F5] dark:bg-[#262626] rounded"></div></td>
                    <td className="py-4 px-4"><div className="h-4 w-24 bg-[#FAF9F5] dark:bg-[#262626] rounded"></div></td>
                    <td className="py-4 px-4 text-center"><div className="h-4 w-12 mx-auto bg-[#FAF9F5] dark:bg-[#262626] rounded"></div></td>
                    <td className="py-4 px-4 text-center"><div className="h-4 w-8 mx-auto bg-[#FAF9F5] dark:bg-[#262626] rounded"></div></td>
                    <td className="py-4 px-4 text-center"><div className="h-4 w-8 mx-auto bg-[#FAF9F5] dark:bg-[#262626] rounded"></div></td>
                    <td className="py-4 px-4 text-right"><div className="h-6 w-16 ml-auto bg-[#FAF9F5] dark:bg-[#262626] rounded"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : safeShipments.length === 0 ? (
          /* Empty State: No Shipments in Store */
          <div className="p-12 text-center bg-white dark:bg-[#1F1F1F] space-y-2 font-sans">
            <Package className="w-8 h-8 text-[#4A4A45] dark:text-[#9E9E98] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#252525] dark:text-[#F5F5F0]">No shipments found</h3>
            <p className="text-xs text-[#4A4A45] dark:text-[#9E9E98] max-w-sm mx-auto font-sans">
              New immutable events will appear here as shipments are processed.
            </p>
            <div className="pt-2">
              <PrimaryButton icon={Plus} onClick={onOpenNewShipmentModal}>
                Dispatch Shipment
              </PrimaryButton>
            </div>
          </div>
        ) : filteredShipments.length === 0 ? (
          /* Empty State: No Search/Filter Results */
          <div className="p-12 text-center bg-white dark:bg-[#1F1F1F] space-y-2 font-sans">
            <Search className="w-8 h-8 text-[#4A4A45] dark:text-[#9E9E98] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#252525] dark:text-[#F5F5F0]">No shipments found</h3>
            <p className="text-xs text-[#4A4A45] dark:text-[#9E9E98] max-w-sm mx-auto font-sans">
              Try another shipment ID or clear search filters.
            </p>
            {(localQuery || filter !== 'ALL') && (
              <button
                onClick={() => {
                  setLocalQuery('');
                  setFilter('ALL');
                }}
                className="mt-2 text-xs text-[#E56B2F] dark:text-[#E5A93C] underline hover:no-underline font-sans font-semibold"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#FAF9F5] dark:bg-[#141414] text-[#4A4A45] dark:text-[#9E9E98] uppercase tracking-wider border-b border-[#DDDCD6] dark:border-[#333333] text-[11px] font-sans">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Shipment ID</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Carrier & Vessel</th>
                  <th className="py-3.5 px-4 font-semibold">Origin → Destination</th>
                  <th className="py-3.5 px-4 font-semibold">Current Location</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Telemetry</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Events</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Version</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDDCD6]/60 dark:divide-[#333333]/60">
                {filteredShipments.map((s) => (
                  <tr
                    key={s.aggregateId}
                    onClick={() => navigate(`/shipments/${s.aggregateId}`)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/shipments/${s.aggregateId}`)}
                    className="hover:bg-[#FAF9F5] dark:hover:bg-[#262626] cursor-pointer transition-colors focus-visible:outline-none focus-visible:bg-[#FAF9F5] dark:focus-visible:bg-[#262626]"
                  >
                    <td className="py-4 px-4 font-bold text-[#E56B2F] dark:text-[#E5A93C] text-sm font-mono">
                      #{s.aggregateId}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded border text-[10px] font-bold ${s.status === 'WARNING'
                            ? 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30'
                            : s.status === 'DELIVERED'
                              ? 'bg-[#3F8F6B]/10 text-[#3F8F6B] border-[#3F8F6B]/30'
                              : 'bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 text-[#E56B2F] dark:text-[#E5A93C] border-[#E56B2F]/30 dark:border-[#E5A93C]/30'
                          }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-[#252525] dark:text-[#F5F5F0]">
                      <div className="font-sans">{s.carrier}</div>
                      <div className="text-[11px] text-[#4A4A45] dark:text-[#9E9E98] font-sans">{s.vessel || 'N/A'}</div>
                    </td>

                    <td className="py-4 px-4 text-[#252525] dark:text-[#F5F5F0]">
                      <div className="font-semibold font-sans">{s.origin}</div>
                      <div className="text-[#4A4A45] dark:text-[#9E9E98] text-[11px] font-sans">↓ {s.destination}</div>
                    </td>

                    <td className="py-4 px-4 text-[#4A4A45] dark:text-[#9E9E98]">
                      <div className="flex items-center gap-1.5 font-sans">
                        <MapPin className="w-3.5 h-3.5 text-[#E56B2F] dark:text-[#E5A93C] shrink-0" />
                        <span className="truncate max-w-[160px]">{s.currentLocation}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {s.lastTemperature !== undefined ? (
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[11px] ${s.lastTemperature > 30 || s.lastTemperature < -10
                              ? 'text-[#C94A4A] font-bold'
                              : 'text-[#252525] dark:text-[#F5F5F0]'
                            }`}
                        >
                          <ThermometerSnowflake className="w-3 h-3" />
                          {s.lastTemperature}°C
                        </span>
                      ) : (
                        <span className="text-[#4A4A45] dark:text-[#9E9E98] font-mono">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-[#252525] dark:text-[#F5F5F0] font-mono">
                      {s.eventCount}
                    </td>

                    <td className="py-4 px-4 text-center text-[#D9A441] dark:text-[#E5A93C] font-bold font-mono">
                      v{s.latestVersion}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/shipments/${s.aggregateId}`);
                        }}
                        className="bg-[#FAF9F5] dark:bg-[#262626] border border-[#DDDCD6] dark:border-[#333333] hover:bg-[#FAF9F5] dark:hover:bg-[#333333] text-[#E56B2F] dark:text-[#E5A93C] px-3 py-1.5 rounded text-xs font-sans transition-colors inline-flex items-center gap-1 font-semibold focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
                      >
                        <span>Timeline</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
