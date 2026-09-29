import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AlertTriangle, RotateCcw, Database, Activity, ShieldAlert, BarChart3 } from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';

export const AnalyticsPage: React.FC = () => {
  const { shipments = [], fetchShipments, isLoading, error } = useShipmentStore();

  // Detect dark mode reactively for Recharts stroke colors
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const safeShipments = Array.isArray(shipments) ? shipments : [];

  // Metrics
  const totalEvents = safeShipments.reduce((acc, s) => acc + (s?.eventCount || 0), 0);
  const totalStreams = safeShipments.length;
  const anomalyCount = safeShipments.filter((s) => s?.status === 'WARNING').length;
  const anomalyRate = totalStreams > 0 ? Math.round((anomalyCount / totalStreams) * 100) : 0;

  // Zero-jump loading state matching chart layout
  if (isLoading && safeShipments.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn font-mono">
        <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-2">
          <div className="h-6 w-56 bg-[#FAF9F5] dark:bg-[#262626] rounded animate-pulse"></div>
          <div className="h-4 w-80 bg-[#FAF9F5] dark:bg-[#262626] rounded animate-pulse"></div>
        </div>

        {/* 3 KPI Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1F1F1F] p-4 rounded-md border border-[#DDDCD6] dark:border-[#333333] h-24 animate-pulse space-y-2">
              <div className="h-3 w-28 bg-[#FAF9F5] dark:bg-[#262626] rounded"></div>
              <div className="h-7 w-20 bg-[#FAF9F5] dark:bg-[#262626] rounded"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm h-80 animate-pulse"></div>
          <div className="bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm h-80 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Transform shipment event data for charts
  const eventTypeCounts: { [key: string]: number } = {};
  safeShipments.forEach((s) => {
    (s?.events || []).forEach((e) => {
      if (e?.eventType) {
        eventTypeCounts[e.eventType] = (eventTypeCounts[e.eventType] || 0) + 1;
      }
    });
  });

  const eventChartData = Object.keys(eventTypeCounts).map((k) => ({
    name: k,
    count: eventTypeCounts[k],
  }));

  const carrierData = safeShipments.map((s) => ({
    name: s?.aggregateId || 'N/A',
    events: s?.eventCount || 0,
    version: s?.latestVersion || 1,
  }));

  const chartTheme = {
    grid: isDark ? '#2A2A2E' : '#E8E8E4',
    axis: isDark ? '#8E8E93' : '#636366',
    tooltipBg: isDark ? '#1C1C1F' : '#FFFFFF',
    tooltipBorder: isDark ? '#38383C' : '#DDDCD6',
    tooltipText: isDark ? '#F4F4F6' : '#18181B',
  };

  return (
    <div className="space-y-6 animate-fadeIn transition-colors font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#252525] dark:text-[#F5F5F0] tracking-tight font-sans">
              Event Store &amp; Stream Analytics
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#3F8F6B]/10 text-[#3F8F6B] border border-[#3F8F6B]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3F8F6B]" />
              Telemetry Realtime
            </span>
          </div>
          <p className="text-xs text-[#4A4A45] dark:text-[#9E9E98] mt-1 font-sans">
            CQRS write-model event velocity, aggregate stream depth, and anomaly distribution
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98]">
          <Database className="w-3.5 h-3.5 text-[#E56B2F] dark:text-[#E5A93C]" />
          <span>EventStore Engine v2.0</span>
        </div>
      </div>

      {/* Error Banner with In-Place Retry */}
      {error && (
        <div className="p-3.5 bg-[#C94A4A]/10 border border-[#C94A4A]/30 text-[#C94A4A] rounded-md text-xs font-sans flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C94A4A] shrink-0" />
            <span>Unable to load analytics metrics: {error}</span>
          </div>
          <button
            onClick={() => fetchShipments()}
            className="bg-[#C94A4A] hover:bg-[#B03A3A] text-white px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 focus-visible:ring-1 focus-visible:ring-[#C94A4A] focus:outline-none font-sans active:scale-[0.98]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 3 High-Density KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
        {/* Total Appended Events */}
        <div className="bg-white dark:bg-[#1F1F1F] p-4 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider">
            <span>Total Events Appended</span>
            <Activity className="w-4 h-4 text-[#E56B2F] dark:text-[#E5A93C]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#252525] dark:text-[#F5F5F0]">
            {error ? '—' : totalEvents}
          </div>
          <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] font-sans">
            Immutable commits persisted in ledger
          </p>
        </div>

        {/* Aggregate Streams */}
        <div className="bg-white dark:bg-[#1F1F1F] p-4 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider">
            <span>Active Streams</span>
            <BarChart3 className="w-4 h-4 text-[#3A8B88]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#252525] dark:text-[#F5F5F0]">
            {error ? '—' : totalStreams}
          </div>
          <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] font-sans">
            Independent aggregate root streams
          </p>
        </div>

        {/* Anomaly Frequency */}
        <div className="bg-white dark:bg-[#1F1F1F] p-4 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider">
            <span>Telemetry Anomalies</span>
            <ShieldAlert className="w-4 h-4 text-[#C94A4A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#C94A4A]">
            {error ? '—' : `${anomalyRate}%`}
          </div>
          <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] font-sans">
            {anomalyCount} stream{anomalyCount === 1 ? '' : 's'} reporting out-of-range sensor events
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Types Breakdown */}
        <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-3">
            <div>
              <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm font-sans">Event Volume by Type</h3>
              <p className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-sans mt-0.5">Distribution across domain event types</p>
            </div>
            <span className="text-[11px] font-mono text-[#6B6B66] dark:text-[#9E9E98] bg-[#FAF9F5] dark:bg-[#141414] px-2 py-0.5 rounded border border-[#DDDCD6] dark:border-[#333333]">
              {eventChartData.length} Types
            </span>
          </div>

          <div className="h-64 w-full min-h-[220px]">
            {eventChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventChartData} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="name" stroke={chartTheme.axis} fontSize={10} tickLine={false} />
                  <YAxis stroke={chartTheme.axis} fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      borderColor: chartTheme.tooltipBorder,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                      color: chartTheme.tooltipText,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="count" fill={isDark ? '#E5A93C' : '#E56B2F'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-1 text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono">
                <p className="font-bold text-[#252525] dark:text-[#F5F5F0]">No event records</p>
                <p className="text-[11px]">New immutable events will appear here as shipments are processed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Aggregate Stream Length */}
        <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-3">
            <div>
              <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm font-sans">Stream Depth by Aggregate</h3>
              <p className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-sans mt-0.5">Committed event sequence depth per shipment</p>
            </div>
            <span className="text-[11px] font-mono text-[#6B6B66] dark:text-[#9E9E98] bg-[#FAF9F5] dark:bg-[#141414] px-2 py-0.5 rounded border border-[#DDDCD6] dark:border-[#333333]">
              {carrierData.length} Streams
            </span>
          </div>

          <div className="h-64 w-full min-h-[220px]">
            {carrierData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={carrierData} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="name" stroke={chartTheme.axis} fontSize={10} tickLine={false} />
                  <YAxis stroke={chartTheme.axis} fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      borderColor: chartTheme.tooltipBorder,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                      color: chartTheme.tooltipText,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="events" fill="#3A8B88" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-1 text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono">
                <p className="font-bold text-[#252525] dark:text-[#F5F5F0]">No aggregate streams</p>
                <p className="text-[11px]">New stream lengths will appear here as containers are dispatched.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
