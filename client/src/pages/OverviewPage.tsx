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

  // Status breakdown chart data
  const statusData = [
    { name: 'In Transit', value: inTransitCount || 1, color: '#38bdf8' },
    { name: 'At Port', value: safeShipments.filter((s) => s?.status === 'AT_PORT').length, color: '#818cf8' },
    { name: 'Customs Cleared', value: safeShipments.filter((s) => s?.status === 'CUSTOMS_CLEARED').length, color: '#c084fc' },
    { name: 'Delivered', value: safeShipments.filter((s) => s?.status === 'DELIVERED').length, color: '#34d399' },
    { name: 'Anomalies', value: warningCount, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  // Collect recent activity events from all shipments
  const recentEvents: (IEvent & { aggregateId: string })[] = safeShipments
    .flatMap((s) => (s?.events || []).map((e) => ({ ...e, aggregateId: s?.aggregateId || 'UNKNOWN' })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Logistics Audit Operations Center
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-mono">
            CQRS Event Sourcing Architecture & Real-Time Aggregate Projections
          </p>
        </div>

        <button
          onClick={onOpenNewShipmentModal}
          className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-teal-900/30 flex items-center gap-2"
        >
          <span>Dispatch New Container</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-mono">
          Note: Backend Connection Info: {error}. Running in mock/cache aggregate mode.
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Total Aggregates
            </span>
            <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20 text-teal-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100 font-mono">{totalShipments}</span>
            <span className="text-xs text-slate-400 font-mono">Active Streams</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Synced with Mongo Store</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              In-Transit Cargo
            </span>
            <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20 text-sky-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-sky-400 font-mono">{inTransitCount}</span>
            <span className="text-xs text-slate-400 font-mono">Vessels Sailing</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span>High Volume Routes</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Telemetry Anomalies
            </span>
            <div className="p-2 bg-amber-500/15 rounded-lg border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-400 font-mono">{warningCount}</span>
            <span className="text-xs text-amber-300/80 font-mono">Temp Spikes</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Requires Inspection</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Immutable Event Stream
            </span>
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-300 font-mono">{totalEvents}</span>
            <span className="text-xs text-slate-400 font-mono">Total Events</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono flex items-center gap-1">
            <span>Append-Only Ledger</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Status Chart & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-100 text-sm">Status Distribution</h3>
            <span className="text-xs text-slate-500 font-mono">Aggregate View</span>
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
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono">
                No distribution data available
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span className="text-slate-400">{d.name}:</span>
                <span className="font-bold text-slate-200">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Immutable Event Activity Stream */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-slate-100 text-sm">Recent Immutable Activity Feed</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Real-time CQRS Log</span>
            </div>

            <div className="space-y-3">
              {recentEvents.length > 0 ? (
                recentEvents.map((ev, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/shipments/${ev.aggregateId}`)}
                    className="cursor-pointer p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 hover:border-teal-500/50 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20">
                        {ev.aggregateId}
                      </span>
                      <div>
                        <div className="font-mono text-slate-200 font-semibold">{ev.eventType}</div>
                        <div className="text-slate-400 text-[11px] truncate max-w-xs">
                          {ev.payload?.location || ev.payload?.notes || `Version #${ev.version}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>
                          {ev.timestamp
                            ? new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'N/A'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 font-mono bg-slate-950/50 rounded-xl">
                  No recent events recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Directory Summary Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Active Shipments Ledger</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Click any shipment to inspect its complete chronological event timeline
            </p>
          </div>
          <button
            onClick={() => navigate('/shipments')}
            className="text-xs text-teal-400 hover:text-teal-300 font-mono flex items-center gap-1"
          >
            <span>View All Shipments →</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Shipment ID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Route</th>
                <th className="py-3.5 px-4">Current Location</th>
                <th className="py-3.5 px-4 text-center">Event Count</th>
                <th className="py-3.5 px-4 text-center">Latest Version</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {safeShipments.map((s) => (
                <tr
                  key={s.aggregateId}
                  onClick={() => navigate(`/shipments/${s.aggregateId}`)}
                  className="hover:bg-slate-850/80 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-teal-300">{s.aggregateId}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                        s.status === 'WARNING'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : s.status === 'DELIVERED'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {s.origin} → {s.destination}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-teal-400" />
                      <span>{s.currentLocation}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-200">{s.eventCount}</td>
                  <td className="py-3.5 px-4 text-center text-amber-400">v{s.latestVersion}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-teal-400 hover:underline">Timeline →</span>
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
