import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  ShieldAlert,
  Database,
  Activity,
  ArrowUpRight,
  MapPin,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useShipmentStore } from '../store/useShipmentStore';
import { IEvent } from '../types';

interface OverviewPageProps {
  onOpenNewShipmentModal: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onOpenNewShipmentModal }) => {
  const navigate = useNavigate();
  const { shipments = [], fetchShipments, isLoading, error } = useShipmentStore();

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const safeShipments = Array.isArray(shipments) ? shipments : [];

  // Aggregate metrics calculation
  const totalShipments = safeShipments.length;
  const inTransitCount = safeShipments.filter((s) => s?.status === 'IN_TRANSIT').length;
  const warningCount = safeShipments.filter((s) => s?.status === 'WARNING').length;
  const totalEvents = safeShipments.reduce((acc, s) => acc + (s?.eventCount || 0), 0);

  // Status breakdown chart data matching Stitch colors (#4d8eff, #818cf8, #c084fc, #10b981, #f59e0b)
  const statusData = [
    { name: 'In Transit', value: inTransitCount || (totalShipments > 0 ? 0 : 1), color: '#4d8eff' },
    { name: 'At Port', value: safeShipments.filter((s) => s?.status === 'AT_PORT').length, color: '#818cf8' },
    { name: 'Customs Cleared', value: safeShipments.filter((s) => s?.status === 'CUSTOMS_CLEARED').length, color: '#c084fc' },
    { name: 'Delivered', value: safeShipments.filter((s) => s?.status === 'DELIVERED').length, color: '#10b981' },
    { name: 'Anomalies', value: warningCount, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  // Collect recent activity events from all shipments
  const recentEvents: (IEvent & { aggregateId: string })[] = safeShipments
    .flatMap((s) => (s?.events || []).map((e) => ({ ...e, aggregateId: s?.aggregateId || 'UNKNOWN' })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Top Command Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1c2d] p-6 rounded border border-[#1c2b3c]">
        <div>
          <h1 className="text-2xl font-bold text-[#d4e4fa] tracking-tight font-sans">
            Logistics Audit Operations Center
          </h1>
          <p className="text-xs text-[#8c909f] mt-1 font-mono">
            CQRS Event Sourcing Architecture & Real-Time Aggregate Projections
          </p>
        </div>

        <button
          onClick={onOpenNewShipmentModal}
          className="bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold px-4 py-2 rounded text-xs transition-all shadow font-mono flex items-center gap-2"
        >
          <span>Dispatch New Container</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded text-xs font-mono">
          System Notice: {error}. Running in transient Event Store mode.
        </div>
      )}

      {/* Metric Cards Grid (Stitch Level 1 Cards #122131, border #1c2b3c) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#122131] p-5 rounded border border-[#1c2b3c] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8c909f] uppercase tracking-wider">
              Total Aggregates
            </span>
            <div className="p-1.5 bg-[#4d8eff]/10 rounded border border-[#4d8eff]/20 text-[#4d8eff]">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#d4e4fa] font-mono">{totalShipments}</span>
            <span className="text-xs text-[#8c909f] font-mono">Active Streams</span>
          </div>
          <div className="mt-2 text-xs text-[#8c909f] font-mono flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-[#4d8eff]" />
            <span>Synced Mongo Event Store</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#122131] p-5 rounded border border-[#1c2b3c] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8c909f] uppercase tracking-wider">
              In-Transit Cargo
            </span>
            <div className="p-1.5 bg-sky-500/10 rounded border border-sky-500/20 text-sky-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#adc6ff] font-mono">{inTransitCount}</span>
            <span className="text-xs text-[#8c909f] font-mono">Vessels Sailing</span>
          </div>
          <div className="mt-2 text-xs text-[#8c909f] font-mono flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#adc6ff]" />
            <span>High Density Corridors</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#122131] p-5 rounded border border-[#1c2b3c] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8c909f] uppercase tracking-wider">
              Telemetry Anomalies
            </span>
            <div className="p-1.5 bg-amber-500/15 rounded border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-400 font-mono">{warningCount}</span>
            <span className="text-xs text-amber-300/80 font-mono">Temp Spikes</span>
          </div>
          <div className="mt-2 text-xs text-[#8c909f] font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Requires Inspection</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#122131] p-5 rounded border border-[#1c2b3c] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8c909f] uppercase tracking-wider">
              Immutable Stream
            </span>
            <div className="p-1.5 bg-purple-500/10 rounded border border-purple-500/20 text-purple-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-300 font-mono">{totalEvents}</span>
            <span className="text-xs text-[#8c909f] font-mono">Events Persisted</span>
          </div>
          <div className="mt-2 text-xs text-[#8c909f] font-mono flex items-center gap-1">
            <span>Append-Only Ledger</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Status Chart & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-[#122131] p-6 rounded border border-[#1c2b3c]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#d4e4fa] text-sm font-sans">Status Distribution</h3>
            <span className="text-[11px] text-[#8c909f] font-mono">Aggregate View</span>
          </div>

          <div className="h-52 w-full min-h-[200px]">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#051424" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#010f1f',
                      borderColor: '#1c2b3c',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-[#8c909f] font-mono">
                No status data available
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }}></span>
                <span className="text-[#8c909f]">{d.name}:</span>
                <span className="font-bold text-[#d4e4fa]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Immutable Event Activity Stream */}
        <div className="lg:col-span-2 bg-[#122131] p-6 rounded border border-[#1c2b3c] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#4d8eff]" />
                <h3 className="font-bold text-[#d4e4fa] text-sm font-sans">Recent Immutable Activity Feed</h3>
              </div>
              <span className="text-[11px] text-[#8c909f] font-mono">Real-time CQRS Log</span>
            </div>

            <div className="space-y-2.5">
              {recentEvents.length > 0 ? (
                recentEvents.map((ev, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/shipments/${ev.aggregateId}`)}
                    className="cursor-pointer p-3 bg-[#010f1f] rounded border border-[#1c2b3c] hover:bg-[#1c2b3c] hover:border-[#273647] transition-all flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#adc6ff] bg-[#4d8eff]/10 px-2 py-0.5 rounded border border-[#4d8eff]/20">
                        {ev.aggregateId}
                      </span>
                      <div>
                        <div className="text-[#d4e4fa] font-bold">[ {ev.eventType} ]</div>
                        <div className="text-[#8c909f] text-[11px] truncate max-w-xs">
                          {ev.payload?.location || ev.payload?.notes || `Version #${ev.version}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#8c909f]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8c909f]" />
                        <span>
                          {ev.timestamp
                            ? new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'N/A'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8c909f]" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[#8c909f] font-mono bg-[#010f1f] rounded border border-[#1c2b3c]">
                  No recent events recorded in store.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Directory Table */}
      <div className="bg-[#122131] rounded border border-[#1c2b3c] overflow-hidden">
        <div className="p-5 border-b border-[#1c2b3c] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#d4e4fa] text-sm font-sans">Active Shipments Ledger</h3>
            <p className="text-xs text-[#8c909f] font-mono mt-0.5">
              Click any shipment to inspect its complete chronological event timeline
            </p>
          </div>
          <button
            onClick={() => navigate('/shipments')}
            className="text-xs text-[#4d8eff] hover:underline font-mono flex items-center gap-1"
          >
            <span>View All Shipments →</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#010f1f] text-[#8c909f] uppercase tracking-wider border-b border-[#1c2b3c] text-[11px]">
              <tr>
                <th className="py-3 px-4">Shipment ID</th>
                <th className="py-3 px-4">Status & Version</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Current Location</th>
                <th className="py-3 px-4 text-center">Event Count</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2b3c]/60">
              {safeShipments.map((s) => (
                <tr
                  key={s.aggregateId}
                  onClick={() => navigate(`/shipments/${s.aggregateId}`)}
                  className="hover:bg-[#1c2b3c] cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-[#adc6ff]">{s.aggregateId}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                          s.status === 'WARNING'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : s.status === 'DELIVERED'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                        }`}
                      >
                        [ {s.status} ]
                      </span>
                      <span className="text-[#adc6ff] text-[10px] bg-[#010f1f] px-1.5 py-0.5 rounded border border-[#273647]">
                        v{s.latestVersion || 1}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#d4e4fa]">
                    {s.origin} → {s.destination}
                  </td>
                  <td className="py-3.5 px-4 text-[#8c909f]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#4d8eff]" />
                      <span>{s.currentLocation}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center text-[#d4e4fa] font-bold">{s.eventCount}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[#4d8eff] hover:underline">Inspect Timeline →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
