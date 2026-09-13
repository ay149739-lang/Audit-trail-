import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Plus, ArrowRight, ThermometerSnowflake, X } from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';
import { TechTerm } from '../components/TechTerm';

interface ShipmentsPageProps {
  onOpenNewShipmentModal: () => void;
}

export const ShipmentsPage: React.FC<ShipmentsPageProps> = ({ onOpenNewShipmentModal }) => {
  const navigate = useNavigate();
  const { shipments = [], fetchShipments, isLoading } = useShipmentStore();
  const [filter, setFilter] = useState<string>('ALL');
  const [localQuery, setLocalQuery] = useState<string>('');

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const safeShipments = Array.isArray(shipments) ? shipments : [];

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
    <div className="space-y-6 animate-fadeIn transition-colors">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#252525] dark:text-[#F5F5F0]">Shipments Aggregate Directory</h1>
          <p className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono mt-1 flex items-center gap-1.5">
            <TechTerm
              term="Read Model Projections"
              definition="Materialized query models maintained by the background projection worker from immutable events."
            />
            <span>• Append-Only Event Store</span>
          </p>
        </div>

        {/* Standardized Primary Action Button */}
        <button
          onClick={onOpenNewShipmentModal}
          className="inline-flex items-center gap-1.5 bg-[#E56B2F] hover:bg-[#D45A1E] dark:bg-[#E5A93C] dark:hover:bg-[#D49A2A] text-white dark:text-[#141414] px-3.5 py-2 rounded-md text-xs font-bold font-mono transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Dispatch New Shipment</span>
        </button>
      </div>

      {/* Filter Tabs & Local Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filter Buttons */}
        <div className="flex bg-white dark:bg-[#1F1F1F] p-1 rounded-md border border-[#DDDCD6] dark:border-[#333333] text-xs font-mono shadow-sm">
          {['ALL', 'IN_TRANSIT', 'AT_PORT', 'WARNING', 'DELIVERED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded transition-all focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none ${
                filter === f
                  ? 'bg-[#FAF9F5] dark:bg-[#262626] text-[#E56B2F] dark:text-[#E5A93C] border border-[#DDDCD6] dark:border-[#333333] font-bold shadow-sm'
                  : 'text-[#6B6B66] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0]'
              }`}
            >
              {f === 'ALL'
                ? `All (${safeShipments.length})`
                : f === 'WARNING'
                ? `Anomalies (${safeShipments.filter((s) => s?.status === 'WARNING').length})`
                : f}
            </button>
          ))}
        </div>

        {/* Local Search Input with Clear Button */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66] dark:text-[#9E9E98]" />
          <input
            type="text"
            aria-label="Filter shipments directory"
            placeholder="Filter by ID, location, carrier..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md pl-9 pr-8 py-2 text-xs text-[#252525] dark:text-[#F5F5F0] placeholder-[#6B6B66] dark:placeholder-[#9E9E98] focus:outline-none focus:border-[#E56B2F] dark:focus:border-[#E5A93C] font-mono shadow-sm"
          />
          {localQuery && (
            <button
              onClick={() => setLocalQuery('')}
              aria-label="Clear filter query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B6B66] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Shipments Grid / Table */}
      <div className="bg-white dark:bg-[#1F1F1F] rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm overflow-hidden">
        {isLoading && safeShipments.length === 0 ? (
          /* Zero-jump table skeleton loader */
          <div className="p-6 space-y-3 font-mono">
            <div className="h-4 bg-[#FAF9F5] dark:bg-[#262626] rounded animate-pulse w-48"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-[#FAF9F5] dark:bg-[#1A1A1A] rounded animate-pulse w-full"></div>
            ))}
          </div>
        ) : filteredShipments.length === 0 ? (
          /* Informative Empty State */
          <div className="p-12 text-center bg-white dark:bg-[#1F1F1F] space-y-2 font-mono">
            <Search className="w-8 h-8 text-[#6B6B66] dark:text-[#9E9E98] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#252525] dark:text-[#F5F5F0]">No shipments found</h3>
            <p className="text-xs text-[#6B6B66] dark:text-[#9E9E98] max-w-sm mx-auto">
              {localQuery
                ? `No shipments match filter query "${localQuery}". Try another shipment ID or route name.`
                : 'No shipments available under the selected filter criteria.'}
            </p>
            {(localQuery || filter !== 'ALL') && (
              <button
                onClick={() => {
                  setLocalQuery('');
                  setFilter('ALL');
                }}
                className="mt-3 text-xs text-[#E56B2F] dark:text-[#E5A93C] underline hover:no-underline font-mono"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#FAF9F5] dark:bg-[#141414] text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider border-b border-[#DDDCD6] dark:border-[#333333] text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Shipment ID</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Carrier & Vessel</th>
                  <th className="py-3.5 px-4">Origin → Destination</th>
                  <th className="py-3.5 px-4">Current Location</th>
                  <th className="py-3.5 px-4 text-center">Telemetry</th>
                  <th className="py-3.5 px-4 text-center">Events</th>
                  <th className="py-3.5 px-4 text-center">Version</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDDCD6]/60 dark:divide-[#333333]/60">
                {filteredShipments.map((s) => (
                  <tr
                    key={s.aggregateId}
                    onClick={() => navigate(`/shipments/${s.aggregateId}`)}
                    className="hover:bg-[#FAF9F5] dark:hover:bg-[#262626] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-[#E56B2F] dark:text-[#E5A93C] text-sm">
                      {s.aggregateId}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded border text-[10px] font-bold ${
                          s.status === 'WARNING'
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
                      <div>{s.carrier}</div>
                      <div className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98]">{s.vessel || 'N/A'}</div>
                    </td>

                    <td className="py-4 px-4 text-[#252525] dark:text-[#F5F5F0]">
                      <div className="font-semibold">{s.origin}</div>
                      <div className="text-[#6B6B66] dark:text-[#9E9E98] text-[11px]">↓ {s.destination}</div>
                    </td>

                    <td className="py-4 px-4 text-[#6B6B66] dark:text-[#9E9E98]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E56B2F] dark:text-[#E5A93C] shrink-0" />
                        <span className="truncate max-w-[160px]">{s.currentLocation}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {s.lastTemperature !== undefined ? (
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                            s.lastTemperature > 30 || s.lastTemperature < -10
                              ? 'text-[#C94A4A] font-bold'
                              : 'text-[#252525] dark:text-[#F5F5F0]'
                          }`}
                        >
                          <ThermometerSnowflake className="w-3 h-3" />
                          {s.lastTemperature}°C
                        </span>
                      ) : (
                        <span className="text-[#6B6B66] dark:text-[#9E9E98]">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-[#252525] dark:text-[#F5F5F0]">
                      {s.eventCount}
                    </td>

                    <td className="py-4 px-4 text-center text-[#D9A441] dark:text-[#E5A93C] font-bold">
                      v{s.latestVersion}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/shipments/${s.aggregateId}`);
                        }}
                        className="bg-[#FAF9F5] dark:bg-[#262626] border border-[#DDDCD6] dark:border-[#333333] hover:bg-[#FAF9F5] dark:hover:bg-[#333333] text-[#E56B2F] dark:text-[#E5A93C] px-3 py-1.5 rounded text-xs font-mono transition-colors inline-flex items-center gap-1 font-semibold focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
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
