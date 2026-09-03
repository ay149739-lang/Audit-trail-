import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Plus, ArrowRight, ThermometerSnowflake } from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';

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

    const q = localQuery.toLowerCase();
    const matchesQuery =
      (s?.aggregateId || '').toLowerCase().includes(q) ||
      (s?.origin || '').toLowerCase().includes(q) ||
      (s?.destination || '').toLowerCase().includes(q) ||
      (s?.currentLocation || '').toLowerCase().includes(q);

    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-md border border-[#DDDCD6] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#252525]">Shipments Aggregate Directory</h1>
          <p className="text-xs text-[#6B6B66] font-mono mt-1">
            Query Model Projections generated from append-only Event Store
          </p>
        </div>

        <button
          onClick={onOpenNewShipmentModal}
          className="bg-[#E56B2F] hover:bg-[#D45A1E] text-white px-4 py-2 rounded-md text-xs font-medium transition-all shadow-sm flex items-center gap-2 font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Shipment</span>
        </button>
      </div>

      {/* Filter Tabs & Local Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filter Buttons */}
        <div className="flex bg-white p-1 rounded-md border border-[#DDDCD6] text-xs font-mono shadow-sm">
          {['ALL', 'IN_TRANSIT', 'AT_PORT', 'WARNING', 'DELIVERED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded transition-all ${
                filter === f
                  ? 'bg-[#FAF9F5] text-[#E56B2F] border border-[#DDDCD6] font-bold shadow-sm'
                  : 'text-[#6B6B66] hover:text-[#252525]'
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

        {/* Local Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B66]" />
          <input
            type="text"
            placeholder="Filter shipments..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full bg-white border border-[#DDDCD6] rounded-md pl-9 pr-4 py-2 text-xs text-[#252525] focus:outline-none focus:border-[#E56B2F] font-mono shadow-sm"
          />
        </div>
      </div>

      {/* Shipments Grid / Table */}
      <div className="bg-white rounded-md border border-[#DDDCD6] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-[#6B6B66]">
            Reconstructing projections from MongoDB Event Store...
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[#6B6B66]">
            No shipments matched your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#FAF9F5] text-[#6B6B66] uppercase tracking-wider border-b border-[#DDDCD6] text-[11px]">
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
              <tbody className="divide-y divide-[#DDDCD6]/60">
                {filteredShipments.map((s) => (
                  <tr
                    key={s.aggregateId}
                    onClick={() => navigate(`/shipments/${s.aggregateId}`)}
                    className="hover:bg-[#FAF9F5] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-[#E56B2F] text-sm">
                      {s.aggregateId}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded border text-[10px] font-bold ${
                          s.status === 'WARNING'
                            ? 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30'
                            : s.status === 'DELIVERED'
                            ? 'bg-[#3F8F6B]/10 text-[#3F8F6B] border-[#3F8F6B]/30'
                            : 'bg-[#E56B2F]/10 text-[#E56B2F] border-[#E56B2F]/30'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-[#252525]">
                      <div>{s.carrier}</div>
                      <div className="text-[11px] text-[#6B6B66]">{s.vessel || 'N/A'}</div>
                    </td>

                    <td className="py-4 px-4 text-[#252525]">
                      <div className="font-semibold">{s.origin}</div>
                      <div className="text-[#6B6B66] text-[11px]">↓ {s.destination}</div>
                    </td>

                    <td className="py-4 px-4 text-[#6B6B66]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E56B2F] shrink-0" />
                        <span className="truncate max-w-[160px]">{s.currentLocation}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {s.lastTemperature !== undefined ? (
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                            s.lastTemperature > 30 || s.lastTemperature < -10
                              ? 'text-[#C94A4A] font-bold'
                              : 'text-[#252525]'
                          }`}
                        >
                          <ThermometerSnowflake className="w-3 h-3" />
                          {s.lastTemperature}°C
                        </span>
                      ) : (
                        <span className="text-[#6B6B66]">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-[#252525]">
                      {s.eventCount}
                    </td>

                    <td className="py-4 px-4 text-center text-[#D9A441] font-bold">
                      v{s.latestVersion}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/shipments/${s.aggregateId}`);
                        }}
                        className="bg-[#FAF9F5] border border-[#DDDCD6] hover:bg-[#FAF9F5] text-[#E56B2F] px-3 py-1.5 rounded text-xs font-mono transition-colors inline-flex items-center gap-1 font-semibold"
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
