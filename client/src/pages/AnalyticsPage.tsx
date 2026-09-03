import React, { useEffect } from 'react';
import { BarChart3, Database, ShieldAlert, Activity, TrendingUp, Layers } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useShipmentStore } from '../store/useShipmentStore';

export const AnalyticsPage: React.FC = () => {
  const { shipments = [], fetchShipments } = useShipmentStore();

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const safeShipments = Array.isArray(shipments) ? shipments : [];

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

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-bold text-slate-100">Event Store Analytics</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Historical Event Volume & Aggregate Stream Metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Types Breakdown */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm">Event Volume by Type</h3>
            <span className="text-xs text-slate-500 font-mono">Immutable Store</span>
          </div>

          <div className="h-64 w-full min-h-[200px]">
            {eventChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono">
                No events recorded for charts
              </div>
            )}
          </div>
        </div>

        {/* Aggregate Stream Length */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm">Stream Length by Aggregate ID</h3>
            <span className="text-xs text-slate-500 font-mono">CQRS Projections</span>
          </div>

          <div className="h-64 w-full min-h-[200px]">
            {carrierData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={carrierData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="events" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono">
                No stream data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
