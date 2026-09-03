import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Search, Plus, Filter, ArrowRight, ThermometerSnowflake, ShieldAlert } from 'lucide-react';
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
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Shipments Aggregate Directory</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Query Model Projections generated from append-only Event Store
          </p>
        </div>

        <button
          onClick={onOpenNewShipmentModal}
          className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-md shadow-teal-900/30 flex items-center gap-2 font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Shipment</span>
        </button>
      </div>

      {/* Filter Tabs & Local Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filter Buttons */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {['ALL', 'IN_TRANSIT', 'AT_PORT', 'WARNING', 'DELIVERED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === f
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter shipments..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
          />
        </div>
      </div>

      {/* Shipments Grid / Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400">
            Reconstructing projections from MongoDB Event Store...
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400">
            No shipments matched your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
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
              <tbody className="divide-y divide-slate-800/60">
                {filteredShipments.map((s) => (
                  <tr
                    key={s.aggregateId}
                    onClick={() => navigate(`/shipments/${s.aggregateId}`)}
                    className="hover:bg-slate-850/80 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-teal-300 text-sm">
                      {s.aggregateId}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md border text-[10px] font-bold ${
                          s.status === 'WARNING'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                            : s.status === 'DELIVERED'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-300">
                      <div>{s.carrier}</div>
                      <div className="text-[11px] text-slate-500">{s.vessel || 'N/A'}</div>
                    </td>

                    <td className="py-4 px-4 text-slate-300">
                      <div className="font-semibold">{s.origin}</div>
                      <div className="text-slate-500 text-[11px]">↓ {s.destination}</div>
                    </td>

                    <td className="py-4 px-4 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{s.currentLocation}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {s.lastTemperature !== undefined ? (
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                            s.lastTemperature > 30 || s.lastTemperature < -10
                              ? 'text-amber-400 font-bold'
                              : 'text-slate-300'
                          }`}
                        >
                          <ThermometerSnowflake className="w-3 h-3" />
                          {s.lastTemperature}°C
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-200">
                      {s.eventCount}
                    </td>

                    <td className="py-4 px-4 text-center text-amber-400 font-bold">
                      v{s.latestVersion}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/shipments/${s.aggregateId}`);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-teal-300 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors inline-flex items-center gap-1"
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
