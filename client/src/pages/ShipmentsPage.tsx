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
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1c2d] p-6 rounded border border-[#1c2b3c]">
        <div>
          <h1 className="text-xl font-bold text-[#d4e4fa] font-sans">Shipments Aggregate Directory</h1>
          <p className="text-xs text-[#8c909f] font-mono mt-1">
            Query Model Projections generated from append-only Event Store
          </p>
        </div>

        <button
          onClick={onOpenNewShipmentModal}
          className="bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold px-4 py-2 rounded text-xs transition-all shadow font-mono flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Shipment</span>
        </button>
      </div>

      {/* Filter Tabs & Local Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filter Buttons */}
        <div className="flex bg-[#010f1f] p-1 rounded border border-[#1c2b3c] text-xs font-mono">
          {['ALL', 'IN_TRANSIT', 'AT_PORT', 'WARNING', 'DELIVERED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded transition-all ${
                filter === f
                  ? 'bg-[#1c2b3c] text-[#4d8eff] border border-[#273647] font-bold'
                  : 'text-[#8c909f] hover:text-[#d4e4fa]'
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c909f]" />
          <input
            type="text"
            placeholder="Filter shipments..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full bg-[#010f1f] border border-[#273647] rounded pl-9 pr-4 py-2 text-xs text-[#d4e4fa] focus:outline-none focus:border-[#4d8eff] font-mono"
          />
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-[#122131] rounded border border-[#1c2b3c] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-[#8c909f]">
            Reconstructing projections from MongoDB Event Store...
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[#8c909f]">
            No shipments matched your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#010f1f] text-[#8c909f] uppercase tracking-wider border-b border-[#1c2b3c] text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Shipment ID</th>
                  <th className="py-3.5 px-4">Status & Version</th>
                  <th className="py-3.5 px-4">Carrier & Vessel</th>
                  <th className="py-3.5 px-4">Origin → Destination</th>
                  <th className="py-3.5 px-4">Current Location</th>
                  <th className="py-3.5 px-4 text-center">Telemetry</th>
                  <th className="py-3.5 px-4 text-center">Events</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2b3c]/60">
                {filteredShipments.map((s) => (
                  <tr
                    key={s.aggregateId}
                    onClick={() => navigate(`/shipments/${s.aggregateId}`)}
                    className="hover:bg-[#1c2b3c] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-[#adc6ff] text-sm">
                      {s.aggregateId}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded border text-[10px] font-bold ${
                            s.status === 'WARNING'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                              : s.status === 'DELIVERED'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                          }`}
                        >
                          [ {s.status} ]
                        </span>
                        <span className="text-[#adc6ff] text-[10px] bg-[#010f1f] px-2 py-0.5 rounded border border-[#273647]">
                          v{s.latestVersion || 1}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-[#d4e4fa]">
                      <div>{s.carrier}</div>
                      <div className="text-[11px] text-[#8c909f]">{s.vessel || 'N/A'}</div>
                    </td>

                    <td className="py-4 px-4 text-[#d4e4fa]">
                      <div className="font-semibold">{s.origin}</div>
                      <div className="text-[#8c909f] text-[11px]">↓ {s.destination}</div>
                    </td>

                    <td className="py-4 px-4 text-[#8c909f]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#4d8eff] shrink-0" />
                        <span className="truncate max-w-[160px]">{s.currentLocation}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {s.lastTemperature !== undefined ? (
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                            s.lastTemperature > 30 || s.lastTemperature < -10
                              ? 'text-amber-400 font-bold'
                              : 'text-[#d4e4fa]'
                          }`}
                        >
                          <ThermometerSnowflake className="w-3 h-3" />
                          {s.lastTemperature}°C
                        </span>
                      ) : (
                        <span className="text-[#8c909f]">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-[#d4e4fa]">
                      {s.eventCount}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/shipments/${s.aggregateId}`);
                        }}
                        className="bg-[#010f1f] border border-[#273647] hover:bg-[#1c2b3c] text-[#adc6ff] px-3 py-1.5 rounded text-xs font-mono transition-colors inline-flex items-center gap-1"
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
