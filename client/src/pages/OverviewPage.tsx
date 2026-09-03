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

  // Status breakdown chart data with Warm Industrial Theme Colors
  const statusData = [
    { name: 'In Transit', value: inTransitCount || 1, color: '#E56B2F' },
    { name: 'At Port', value: safeShipments.filter((s) => s?.status === 'AT_PORT').length, color: '#D9A441' },
    { name: 'Customs Cleared', value: safeShipments.filter((s) => s?.status === 'CUSTOMS_CLEARED').length, color: '#7E6B5A' },
    { name: 'Delivered', value: safeShipments.filter((s) => s?.status === 'DELIVERED').length, color: '#3F8F6B' },
    { name: 'Anomalies', value: warningCount, color: '#C94A4A' },
  ].filter((d) => d.value > 0);

  // Collect recent activity events from all shipments
  const recentEvents: (IEvent & { aggregateId: string })[] = safeShipments
    .flatMap((s) => (s?.events || []).map((e) => ({ ...e, aggregateId: s?.aggregateId || 'UNKNOWN' })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-md border border-[#DDDCD6] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#252525] tracking-tight">
            Logistics Audit Operations Center
          </h1>
          <p className="text-sm text-[#6B6B66] mt-1 font-mono">
            CQRS Event Sourcing Architecture & Real-Time Aggregate Projections
          </p>
        </div>

        <button
          onClick={onOpenNewShipmentModal}
          className="bg-[#E56B2F] hover:bg-[#D45A1E] text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm flex items-center gap-2"
        >
          <span>Dispatch New Container</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-[#DDDCD6] text-[#D9A441] rounded-md text-xs font-mono">
          Note: Backend Status Notice: {error}. Running in Event Store fallback mode.
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-md border border-[#DDDCD6] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#6B6B66] uppercase tracking-wider">
              Total Aggregates
            </span>
            <div className="p-2 bg-[#E56B2F]/10 rounded-md border border-[#E56B2F]/20 text-[#E56B2F]">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#252525] font-mono">{totalShipments}</span>
            <span className="text-xs text-[#6B6B66] font-mono">Active Streams</span>
          </div>
          <div className="mt-2 text-xs text-[#6B6B66] font-mono flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-[#E56B2F]" />
            <span>Synced with Mongo Store</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-md border border-[#DDDCD6] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#6B6B66] uppercase tracking-wider">
              In-Transit Cargo
            </span>
            <div className="p-2 bg-[#E56B2F]/10 rounded-md border border-[#E56B2F]/20 text-[#E56B2F]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#E56B2F] font-mono">{inTransitCount}</span>
            <span className="text-xs text-[#6B6B66] font-mono">Vessels Sailing</span>
          </div>
          <div className="mt-2 text-xs text-[#6B6B66] font-mono flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#E56B2F]" />
            <span>High Volume Routes</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-md border border-[#DDDCD6] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#6B6B66] uppercase tracking-wider">
              Telemetry Anomalies
            </span>
            <div className="p-2 bg-[#C94A4A]/10 rounded-md border border-[#C94A4A]/20 text-[#C94A4A]">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#C94A4A] font-mono">{warningCount}</span>
            <span className="text-xs text-[#C94A4A] font-mono">Temp Spikes</span>
          </div>
          <div className="mt-2 text-xs text-[#6B6B66] font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#C94A4A]"></span>
            <span>Requires Inspection</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-md border border-[#DDDCD6] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#6B6B66] uppercase tracking-wider">
              Immutable Event Stream
            </span>
            <div className="p-2 bg-amber-50 rounded-md border border-[#D9A441]/30 text-[#D9A441]">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#252525] font-mono">{totalEvents}</span>
            <span className="text-xs text-[#6B6B66] font-mono">Total Events</span>
          </div>
          <div className="mt-2 text-xs text-[#6B6B66] font-mono flex items-center gap-1">
            <span>Append-Only Ledger</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Status Chart & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="bg-white p-6 rounded-md border border-[#DDDCD6] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#252525] text-sm">Status Distribution</h3>
            <span className="text-xs text-[#6B6B66] font-mono">Aggregate View</span>
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#DDDCD6',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                      color: '#252525',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-[#6B6B66] font-mono">
                No distribution data available
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: d.color }}></span>
                <span className="text-[#6B6B66]">{d.name}:</span>
                <span className="font-bold text-[#252525]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Immutable Event Activity Stream */}
        <div className="lg:col-span-2 bg-white p-6 rounded-md border border-[#DDDCD6] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#E56B2F]" />
                <h3 className="font-bold text-[#252525] text-sm">Recent Immutable Activity Feed</h3>
              </div>
              <span className="text-xs text-[#6B6B66] font-mono">Real-time CQRS Log</span>
            </div>

            <div className="space-y-2.5">
              {recentEvents.length > 0 ? (
                recentEvents.map((ev, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/shipments/${ev.aggregateId}`)}
                    className="cursor-pointer p-3 bg-[#FAF9F5] rounded-md border border-[#DDDCD6] hover:border-[#B8B7B0] transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#E56B2F] bg-[#E56B2F]/10 px-2 py-0.5 rounded border border-[#E56B2F]/20">
                        {ev.aggregateId}
                      </span>
                      <div>
                        <div className="font-mono text-[#252525] font-semibold">{ev.eventType}</div>
                        <div className="text-[#6B6B66] text-[11px] truncate max-w-xs font-mono">
                          {ev.payload?.location || ev.payload?.notes || `Version #${ev.version}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-[#6B6B66]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#6B6B66]" />
                        <span>
                          {ev.timestamp
                            ? new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'N/A'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6B6B66]" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[#6B6B66] font-mono bg-[#FAF9F5] rounded-md border border-[#DDDCD6]">
                  No recent events recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Directory Summary Table */}
      <div className="bg-white rounded-md border border-[#DDDCD6] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#DDDCD6] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#252525] text-sm">Active Shipments Ledger</h3>
            <p className="text-xs text-[#6B6B66] font-mono mt-0.5">
              Click any shipment to inspect its complete chronological event timeline
            </p>
          </div>
          <button
            onClick={() => navigate('/shipments')}
            className="text-xs text-[#E56B2F] hover:underline font-mono flex items-center gap-1 font-semibold"
          >
            <span>View All Shipments →</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#FAF9F5] text-[#6B6B66] uppercase tracking-wider border-b border-[#DDDCD6] text-[11px]">
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
            <tbody className="divide-y divide-[#DDDCD6]/60">
              {safeShipments.map((s) => (
                <tr
                  key={s.aggregateId}
                  onClick={() => navigate(`/shipments/${s.aggregateId}`)}
                  className="hover:bg-[#FAF9F5] cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-[#E56B2F]">{s.aggregateId}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
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
                  <td className="py-3.5 px-4 text-[#252525]">
                    {s.origin} → {s.destination}
                  </td>
                  <td className="py-3.5 px-4 text-[#6B6B66]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#E56B2F]" />
                      <span>{s.currentLocation}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center text-[#252525] font-bold">{s.eventCount}</td>
                  <td className="py-3.5 px-4 text-center text-[#D9A441] font-bold">v{s.latestVersion}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[#E56B2F] hover:underline font-semibold">Timeline →</span>
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
