import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  ShieldAlert,
  Database,
  Activity,
  Plus,
  MapPin,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Navigation,
  ThermometerSnowflake,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useShipmentStore } from '../store/useShipmentStore';
import { IEvent } from '../types';
import { TechTerm } from '../components/TechTerm';

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
    { name: 'In Transit', value: inTransitCount, color: '#E5A93C' },
    { name: 'At Port', value: safeShipments.filter((s) => s?.status === 'AT_PORT').length, color: '#3A8B88' },
    { name: 'Customs Cleared', value: safeShipments.filter((s) => s?.status === 'CUSTOMS_CLEARED').length, color: '#70706A' },
    { name: 'Delivered', value: safeShipments.filter((s) => s?.status === 'DELIVERED').length, color: '#3F8F6B' },
    { name: 'Anomalies', value: warningCount, color: '#C94A4A' },
  ].filter((d) => d.value > 0);

  // Collect recent activity events from all shipments
  const recentEvents: (IEvent & { aggregateId: string })[] = safeShipments
    .flatMap((s) => (s?.events || []).map((e) => ({ ...e, aggregateId: s?.aggregateId || 'UNKNOWN' })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  // Skeleton loaders for zero-jump loading state
  if (isLoading && safeShipments.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn font-mono">
        <div className="bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-64 bg-[#FAF9F5] dark:bg-[#262626] rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-[#FAF9F5] dark:bg-[#262626] rounded animate-pulse"></div>
          </div>
          <div className="h-9 w-40 bg-[#FAF9F5] dark:bg-[#262626] rounded animate-pulse"></div>
        </div>

        {/* 4 Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] h-28 animate-pulse space-y-3">
              <div className="h-4 w-24 bg-[#FAF9F5] dark:bg-[#262626] rounded"></div>
              <div className="h-8 w-16 bg-[#FAF9F5] dark:bg-[#262626] rounded"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] h-72 animate-pulse"></div>
          <div className="lg:col-span-2 bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] h-72 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn transition-colors">
      {/* Overview Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#252525] dark:text-[#F5F5F0] tracking-tight">
            Logistics Audit Operations Center
          </h1>
          <p className="text-xs text-[#6B6B66] dark:text-[#9E9E98] mt-1 font-mono flex flex-wrap items-center gap-1.5">
            <TechTerm
              term="CQRS"
              definition="Command Query Responsibility Segregation separates write commands from read-optimized queries."
            />
            <span>•</span>
            <TechTerm
              term="Event Sourcing"
              definition="State changes are logged as an immutable chronological sequence of append-only events."
            />
            <span>•</span>
            <span>Real-Time Read Model Projections</span>
          </p>
        </div>

        {/* Standardized Primary Action Button */}
        <button
          onClick={onOpenNewShipmentModal}
          className="inline-flex items-center gap-1.5 bg-[#E56B2F] hover:bg-[#D45A1E] dark:bg-[#E5A93C] dark:hover:bg-[#D49A2A] text-white dark:text-[#141414] px-3.5 py-2 rounded-md text-xs font-bold font-mono transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Dispatch New Container</span>
        </button>
      </div>

      {/* Error State with Lightweight Retry Action */}
      {error && (
        <div className="p-3.5 bg-[#C94A4A]/10 border border-[#C94A4A]/30 text-[#C94A4A] rounded-md text-xs font-mono flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C94A4A] shrink-0" />
            <span>Unable to load live event stream telemetry: {error}</span>
          </div>
          <button
            onClick={() => fetchShipments()}
            className="bg-[#C94A4A] text-white hover:bg-[#B03A3A] px-2.5 py-1 rounded text-[11px] font-bold font-mono transition-colors flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry Query</span>
          </button>
        </div>
      )}

      {/* Metric Summary Cards Grid with Subtle Interactivity & Affordance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Aggregates */}
        <div
          onClick={() => navigate('/shipments')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/shipments')}
          title="Click to view all shipment aggregates in directory"
          className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm relative overflow-hidden cursor-pointer hover:border-[#B8B7B0] dark:hover:border-[#E5A93C]/40 hover:bg-[#FAF9F5]/60 dark:hover:bg-[#232323] transition-all group focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider">
              Total Aggregates
            </span>
            <div className="p-2 bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 rounded-md border border-[#E56B2F]/20 dark:border-[#E5A93C]/20 text-[#E56B2F] dark:text-[#E5A93C] group-hover:scale-105 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#252525] dark:text-[#F5F5F0] font-mono">{totalShipments}</span>
            <span className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono">Active Streams</span>
          </div>
          <div className="mt-2 text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-[#E56B2F] dark:text-[#E5A93C]" />
            <span>Synced with Mongo Store →</span>
          </div>
        </div>

        {/* Card 2: In-Transit Cargo */}
        <div
          onClick={() => navigate('/shipments')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/shipments')}
          title="Click to filter in-transit shipments"
          className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm relative overflow-hidden cursor-pointer hover:border-[#B8B7B0] dark:hover:border-[#E5A93C]/40 hover:bg-[#FAF9F5]/60 dark:hover:bg-[#232323] transition-all group focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider">
              In-Transit Cargo
            </span>
            <div className="p-2 bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 rounded-md border border-[#E56B2F]/20 dark:border-[#E5A93C]/20 text-[#E56B2F] dark:text-[#E5A93C] group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#E56B2F] dark:text-[#E5A93C] font-mono">{inTransitCount}</span>
            <span className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono">Vessels Sailing</span>
          </div>
          <div className="mt-2 text-xs text-[#3A8B88] font-mono flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-[#3A8B88]" />
            <span>High Volume Routes →</span>
          </div>
        </div>

        {/* Card 3: Telemetry Anomalies */}
        <div
          onClick={() => navigate('/shipments')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/shipments')}
          title="Click to view warning and anomaly alerts"
          className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm relative overflow-hidden cursor-pointer hover:border-[#C94A4A]/60 hover:bg-[#C94A4A]/5 transition-all group focus-visible:ring-1 focus-visible:ring-[#C94A4A] focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider">
              Telemetry Anomalies
            </span>
            <div className="p-2 bg-[#C94A4A]/10 rounded-md border border-[#C94A4A]/20 text-[#C94A4A] group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#C94A4A] font-mono">{warningCount}</span>
            <span className="text-xs text-[#C94A4A] font-mono">Temp Spikes</span>
          </div>
          <div className="mt-2 text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${warningCount > 0 ? 'bg-[#C94A4A] animate-ping' : 'bg-[#3F8F6B]'}`}></span>
            <span>{warningCount > 0 ? 'Requires Inspection →' : 'No Critical Alerts'}</span>
          </div>
        </div>

        {/* Card 4: Immutable Event Stream */}
        <div
          onClick={() => navigate('/analytics')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/analytics')}
          title="Click to view Event Store Analytics"
          className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm relative overflow-hidden cursor-pointer hover:border-[#B8B7B0] dark:hover:border-[#E5A93C]/40 hover:bg-[#FAF9F5]/60 dark:hover:bg-[#232323] transition-all group focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider">
              Immutable Event Stream
            </span>
            <div className="p-2 bg-amber-50 dark:bg-[#262626] rounded-md border border-[#D9A441]/30 dark:border-[#E5A93C]/30 text-[#D9A441] dark:text-[#E5A93C] group-hover:scale-105 transition-transform">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#252525] dark:text-[#F5F5F0] font-mono">{totalEvents}</span>
            <span className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono">Total Events</span>
          </div>
          <div className="mt-2 text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono flex items-center gap-1">
            <span>Append-Only Ledger Analytics →</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Status Chart & Readable Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm">Status Distribution</h3>
            <span className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono">Read Model View</span>
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#1F1F1F" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141414',
                      borderColor: '#333333',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                      color: '#F5F5F0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono space-y-1">
                <Database className="w-5 h-5 text-[#6B6B66] dark:text-[#9E9E98]" />
                <span>No distribution data available</span>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: d.color }}></span>
                <span className="text-[#6B6B66] dark:text-[#9E9E98]">{d.name}:</span>
                <span className="font-bold text-[#252525] dark:text-[#F5F5F0]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Readable & Polished Immutable Event Activity Stream */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#E56B2F] dark:text-[#E5A93C]" />
                <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm">Recent Immutable Activity Feed</h3>
              </div>
              <span className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono">Real-time CQRS Log</span>
            </div>

            <div className="space-y-2">
              {recentEvents.length > 0 ? (
                recentEvents.map((ev, i) => {
                  const isWarning = ev.eventType === 'TEMPERATURE_SPIKE';
                  const locationText = ev.payload?.location || ev.payload?.origin || ev.payload?.destination;

                  return (
                    <div
                      key={i}
                      onClick={() => navigate(`/shipments/${ev.aggregateId}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/shipments/${ev.aggregateId}`)}
                      className={`cursor-pointer p-3 rounded-md border transition-all flex items-center justify-between gap-3 text-xs font-mono ${
                        isWarning
                          ? 'bg-[#C94A4A]/5 border-[#C94A4A]/30 hover:border-[#C94A4A]/60'
                          : 'bg-[#FAF9F5] dark:bg-[#141414] border-[#DDDCD6] dark:border-[#333333] hover:border-[#B8B7B0] dark:hover:border-[#E5A93C]/40 hover:bg-[#F5F4EE] dark:hover:bg-[#1A1A1A]'
                      }`}
                    >
                      {/* Left: Aggregate ID & Event Type */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono font-bold text-[#E56B2F] dark:text-[#E5A93C] bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 px-2 py-0.5 rounded border border-[#E56B2F]/20 dark:border-[#E5A93C]/20 text-[11px] shrink-0">
                          {ev.aggregateId}
                        </span>

                        <span
                          className={`font-semibold text-xs px-2 py-0.5 rounded border text-[10px] shrink-0 ${
                            isWarning
                              ? 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30'
                              : ev.eventType === 'DELIVERED'
                              ? 'bg-[#3F8F6B]/10 text-[#3F8F6B] border-[#3F8F6B]/30'
                              : 'bg-[#FAF9F5] dark:bg-[#262626] text-[#252525] dark:text-[#F5F5F0] border-[#DDDCD6] dark:border-[#333333]'
                          }`}
                        >
                          {ev.eventType}
                        </span>

                        {/* Location / Payload Highlight */}
                        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#6B6B66] dark:text-[#9E9E98] truncate">
                          {locationText ? (
                            <>
                              <MapPin className="w-3 h-3 text-[#E56B2F] dark:text-[#E5A93C] shrink-0" />
                              <span className="truncate">{locationText}</span>
                            </>
                          ) : ev.payload?.temperature !== undefined ? (
                            <>
                              <ThermometerSnowflake className="w-3 h-3 text-[#C94A4A] shrink-0" />
                              <span className="text-[#C94A4A] font-bold">{ev.payload.temperature}°C</span>
                            </>
                          ) : (
                            <span className="text-[#6B6B66] dark:text-[#9E9E98]">Version #{ev.version}</span>
                          )}
                        </div>
                      </div>

                      {/* Right: Timestamp & Arrow */}
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#6B6B66] dark:text-[#9E9E98] shrink-0">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#6B6B66] dark:text-[#9E9E98]" />
                          <span>
                            {ev.timestamp
                              ? new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'N/A'}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#6B6B66] dark:text-[#9E9E98]" />
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Proper Empty State for Activity Feed */
                <div className="p-8 text-center bg-[#FAF9F5] dark:bg-[#141414] rounded-md border border-[#DDDCD6] dark:border-[#333333] space-y-1">
                  <Clock className="w-6 h-6 text-[#6B6B66] dark:text-[#9E9E98] mx-auto mb-1.5" />
                  <p className="font-mono text-xs font-bold text-[#252525] dark:text-[#F5F5F0]">No recent activity</p>
                  <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] font-mono">
                    New immutable events will appear here as shipments are processed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Directory Summary Table */}
      <div className="bg-white dark:bg-[#1F1F1F] rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#DDDCD6] dark:border-[#333333] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm">Active Shipments Ledger</h3>
            <p className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono mt-0.5">
              Click any shipment to inspect its complete chronological event timeline
            </p>
          </div>
          <button
            onClick={() => navigate('/shipments')}
            className="text-xs text-[#E56B2F] dark:text-[#E5A93C] hover:underline font-mono flex items-center gap-1 font-semibold focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
          >
            <span>View All Shipments →</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#FAF9F5] dark:bg-[#141414] text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider border-b border-[#DDDCD6] dark:border-[#333333] text-[11px]">
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
            <tbody className="divide-y divide-[#DDDCD6]/60 dark:divide-[#333333]/60">
              {safeShipments.length > 0 ? (
                safeShipments.map((s) => (
                  <tr
                    key={s.aggregateId}
                    onClick={() => navigate(`/shipments/${s.aggregateId}`)}
                    className="hover:bg-[#FAF9F5] dark:hover:bg-[#262626] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#E56B2F] dark:text-[#E5A93C]">{s.aggregateId}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
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
                    <td className="py-3.5 px-4 text-[#252525] dark:text-[#F5F5F0]">
                      {s.origin} → {s.destination}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6B66] dark:text-[#9E9E98]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E56B2F] dark:text-[#E5A93C]" />
                        <span>{s.currentLocation}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#252525] dark:text-[#F5F5F0] font-bold">{s.eventCount}</td>
                    <td className="py-3.5 px-4 text-center text-[#D9A441] dark:text-[#E5A93C] font-bold">v{s.latestVersion}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[#E56B2F] dark:text-[#E5A93C] hover:underline font-semibold">Timeline →</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#6B6B66] dark:text-[#9E9E98]">
                    No shipments found in Event Store ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
