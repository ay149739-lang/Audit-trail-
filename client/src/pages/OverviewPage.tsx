import React, { useEffect, useState, useMemo } from 'react';
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
  Search,
  CheckCircle2,
  Filter,
  Radio,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';
import { IEvent, ShipmentAggregate } from '../types';
import { PrimaryButton } from '../components/PrimaryButton';

interface OverviewPageProps {
  onOpenNewShipmentModal: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onOpenNewShipmentModal }) => {
  const navigate = useNavigate();
  const { shipments = [], fetchShipments, isLoading, error } = useShipmentStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPreviewShipment, setSelectedPreviewShipment] = useState<ShipmentAggregate | null>(null);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const safeShipments = Array.isArray(shipments) ? shipments : [];

  // Default selected preview shipment to first or warning shipment
  useEffect(() => {
    if (safeShipments.length > 0 && !selectedPreviewShipment) {
      const warningShipment = safeShipments.find((s) => s.status === 'WARNING');
      setSelectedPreviewShipment(warningShipment || safeShipments[0]);
    }
  }, [safeShipments, selectedPreviewShipment]);

  // Aggregate metrics calculation purely from real data
  const totalShipments = safeShipments.length;
  const inTransitCount = safeShipments.filter((s) => s?.status === 'IN_TRANSIT').length;
  const atPortCount = safeShipments.filter(
    (s) => s?.status === 'AT_PORT' || s?.status === 'CUSTOMS_CLEARED'
  ).length;
  const activeShipmentsCount = inTransitCount + atPortCount;
  const deliveredCount = safeShipments.filter((s) => s?.status === 'DELIVERED').length;
  const warningCount = safeShipments.filter((s) => s?.status === 'WARNING').length;
  const totalEvents = safeShipments.reduce((acc, s) => acc + (s?.eventCount || 0), 0);

  // Filtered shipments based on search and status
  const filteredShipments = useMemo(() => {
    return safeShipments.filter((s) => {
      const matchesSearch =
        s.aggregateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.currentLocation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && (s.status === 'IN_TRANSIT' || s.status === 'AT_PORT' || s.status === 'CUSTOMS_CLEARED')) ||
        s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [safeShipments, searchTerm, statusFilter]);

  // Collect recent events from all shipments
  const recentEvents: (IEvent & { aggregateId: string })[] = useMemo(() => {
    return safeShipments
      .flatMap((s) => (s?.events || []).map((e) => ({ ...e, aggregateId: s?.aggregateId || 'UNKNOWN' })))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 7);
  }, [safeShipments]);

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] h-72 animate-pulse"></div>
          <div className="lg:col-span-4 bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] h-72 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn transition-colors font-sans">
      {/* Top Header & Search / Filter Controls */}
      <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#252525] dark:text-[#F5F5F0] tracking-tight font-sans">
                Logistics Command Center &amp; Audit Ledger
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#3F8F6B]/10 text-[#3F8F6B] border border-[#3F8F6B]/25">
                <Radio className="w-3.5 h-3.5 text-[#3F8F6B] animate-pulse" />
                Stream Live
              </span>
            </div>
            <p className="text-xs text-[#4A4A45] dark:text-[#9E9E98] mt-1 font-sans">
              Immutable event sourcing • CQRS read-model projections • Optimistic concurrency control (OCC)
            </p>
          </div>

          <PrimaryButton icon={Plus} onClick={onOpenNewShipmentModal}>
            Dispatch Shipment
          </PrimaryButton>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DDDCD6]/60 dark:border-[#333333]/60 text-xs">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#888888]" />
            <input
              type="text"
              placeholder="Search by shipment ID, port, vessel, or carrier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-md bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] text-xs font-mono text-[#252525] dark:text-[#F5F5F0] focus:border-[#E56B2F] dark:focus:border-[#E5A93C] focus:outline-none"
            />
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
            <span className="text-[#888888] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Filter:
            </span>
            {[
              { id: 'ALL', label: 'All Shipments' },
              { id: 'ACTIVE', label: `Active (${activeShipmentsCount})` },
              { id: 'IN_TRANSIT', label: `In Transit (${inTransitCount})` },
              { id: 'DELIVERED', label: `Delivered (${deliveredCount})` },
              { id: 'WARNING', label: `Anomalies (${warningCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded transition-colors ${statusFilter === tab.id
                  ? 'bg-[#252525] dark:bg-[#E5A93C] text-white dark:text-[#141414] font-bold shadow-xs'
                  : 'bg-[#FAF9F5] dark:bg-[#141414] text-[#6B6B66] dark:text-[#9E9E98] border border-[#DDDCD6] dark:border-[#333333] hover:text-[#252525] dark:hover:text-[#F5F5F0]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 bg-[#C94A4A]/10 border border-[#C94A4A]/30 text-[#C94A4A] rounded-md text-xs font-sans flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C94A4A] shrink-0" />
            <span>Unable to load live event stream telemetry: {error}</span>
          </div>
          <button
            onClick={() => fetchShipments()}
            className="bg-[#C94A4A] text-white hover:bg-[#B03A3A] px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0 font-sans"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry Query</span>
          </button>
        </div>
      )}

      {/* SUMMARY KPI CARDS (Real Application Data Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Shipments */}
        <div
          onClick={() => navigate('/shipments')}
          role="button"
          tabIndex={0}
          className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm relative overflow-hidden cursor-pointer hover:border-[#B8B7B0] dark:hover:border-[#E5A93C]/40 hover:bg-[#FAF9F5]/70 dark:hover:bg-[#232323] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider">
              Total Shipments
            </span>
            <div className="p-2 bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 rounded-md border border-[#E56B2F]/20 dark:border-[#E5A93C]/20 text-[#E56B2F] dark:text-[#E5A93C]">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#252525] dark:text-[#F5F5F0] font-mono">{totalShipments}</span>
            <span className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono">Aggregates</span>
          </div>
          <div className="mt-2 text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono flex items-center gap-1 group-hover:text-[#E56B2F] dark:group-hover:text-[#E5A93C] transition-colors">
            <span>View all shipments →</span>
          </div>
        </div>

        {/* Card 2: Active Shipments (In Transit + At Port) */}
        <div
          onClick={() => setStatusFilter('ACTIVE')}
          role="button"
          tabIndex={0}
          className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm relative overflow-hidden cursor-pointer hover:border-[#B8B7B0] dark:hover:border-[#E5A93C]/40 hover:bg-[#FAF9F5]/70 dark:hover:bg-[#232323] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider">
              Active Shipments
            </span>
            <div className="p-2 bg-[#3A8B88]/10 rounded-md border border-[#3A8B88]/20 text-[#3A8B88]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#E56B2F] dark:text-[#E5A93C] font-mono">{activeShipmentsCount}</span>
            <span className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono">
              ({inTransitCount} transit, {atPortCount} port)
            </span>
          </div>
          <div className="mt-2 text-xs text-[#3A8B88] font-mono flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active en route</span>
          </div>
        </div>

        {/* Card 3: Delivered */}
        <div
          onClick={() => setStatusFilter('DELIVERED')}
          role="button"
          tabIndex={0}
          className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm relative overflow-hidden cursor-pointer hover:border-[#B8B7B0] dark:hover:border-[#E5A93C]/40 hover:bg-[#FAF9F5]/70 dark:hover:bg-[#232323] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider">
              Delivered
            </span>
            <div className="p-2 bg-[#3F8F6B]/10 rounded-md border border-[#3F8F6B]/20 text-[#3F8F6B]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#3F8F6B] font-mono">{deliveredCount}</span>
            <span className="text-xs text-[#3F8F6B] font-mono">Completed</span>
          </div>
          <div className="mt-2 text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono flex items-center gap-1">
            <span>Verified consignee receipts</span>
          </div>
        </div>

        {/* Card 4: Total Events */}
        <div
          onClick={() => navigate('/analytics')}
          role="button"
          tabIndex={0}
          className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm relative overflow-hidden cursor-pointer hover:border-[#B8B7B0] dark:hover:border-[#E5A93C]/40 hover:bg-[#FAF9F5]/70 dark:hover:bg-[#232323] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider">
              Total Events
            </span>
            <div className="p-2 bg-amber-50 dark:bg-[#262626] rounded-md border border-[#D9A441]/30 dark:border-[#E5A93C]/30 text-[#D9A441] dark:text-[#E5A93C]">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#252525] dark:text-[#F5F5F0] font-mono">{totalEvents}</span>
            <span className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono">Immutable</span>
          </div>
          <div className="mt-2 text-xs text-[#3F8F6B] font-mono flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Append-only Event Store</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT: Shipment Overview Table + Right Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: Shipment Fleet Overview (~65% or 8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1F1F1F] rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm overflow-hidden space-y-0">
          <div className="p-4 border-b border-[#DDDCD6] dark:border-[#333333] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm font-sans">
                Shipment Fleet Overview ({filteredShipments.length})
              </h3>
              <p className="text-xs text-[#4A4A45] dark:text-[#9E9E98] font-sans mt-0.5">
                Materialized read model projections with real-time location &amp; sensor status
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#6B6B66] dark:text-[#9E9E98]">
              Select row to preview details
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#FAF9F5] dark:bg-[#141414] text-[#4A4A45] dark:text-[#9E9E98] uppercase tracking-wider border-b border-[#DDDCD6] dark:border-[#333333] text-[11px]">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">Shipment</th>
                  <th className="py-3 px-3.5 font-semibold">Status</th>
                  <th className="py-3 px-3.5 font-semibold">Route</th>
                  <th className="py-3 px-3.5 font-semibold">Telemetry</th>
                  <th className="py-3 px-3.5 text-center font-semibold">Version</th>
                  <th className="py-3 px-3.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDDCD6]/60 dark:divide-[#333333]/60">
                {filteredShipments.length > 0 ? (
                  filteredShipments.map((s) => {
                    const isSelected = selectedPreviewShipment?.aggregateId === s.aggregateId;
                    return (
                      <tr
                        key={s.aggregateId}
                        onClick={() => setSelectedPreviewShipment(s)}
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedPreviewShipment(s)}
                        className={`cursor-pointer transition-colors ${isSelected
                          ? 'bg-[#FAF9F5] dark:bg-[#252525] border-l-2 border-l-[#E56B2F] dark:border-l-[#E5A93C]'
                          : 'hover:bg-[#FAF9F5]/70 dark:hover:bg-[#202020]'
                          }`}
                      >
                        <td className="py-3 px-3.5 font-bold text-[#E56B2F] dark:text-[#E5A93C] font-mono">
                          #{s.aggregateId}
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`px-2 py-0.5 rounded border text-[10px] font-bold ${s.status === 'WARNING'
                              ? 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30'
                              : s.status === 'DELIVERED'
                                ? 'bg-[#3F8F6B]/10 text-[#3F8F6B] border-[#3F8F6B]/30'
                                : 'bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 text-[#E56B2F] dark:text-[#E5A93C] border-[#E56B2F]/30 dark:border-[#E5A93C]/30'
                              }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-[#252525] dark:text-[#F5F5F0]">
                          <div className="truncate max-w-[200px]">
                            {s.origin} → {s.destination}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-mono">
                          {s.lastTemperature !== undefined ? (
                            <span
                              className={`inline-flex items-center gap-1 font-bold ${s.lastTemperature > 25 || s.lastTemperature < -15
                                ? 'text-[#C94A4A]'
                                : 'text-[#3F8F6B]'
                                }`}
                            >
                              <ThermometerSnowflake className="w-3 h-3" />
                              {s.lastTemperature}°C
                            </span>
                          ) : (
                            <span className="text-[#888888]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-center font-mono text-[#D9A441] dark:text-[#E5A93C] font-bold">
                          v{s.latestVersion}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/shipments/${s.aggregateId}`);
                            }}
                            className="text-[#E56B2F] dark:text-[#E5A93C] hover:underline font-semibold font-mono text-[11px] inline-flex items-center gap-1"
                          >
                            <span>Ledger</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#6B6B66] dark:text-[#9E9E98]">
                      No shipments matching search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT / DETAIL: Selected Shipment Information Panel (~35% or 4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-3">
            <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm">
              Selected Shipment Detail
            </h3>
            {selectedPreviewShipment && (
              <span className="font-mono text-xs font-bold text-[#E56B2F] dark:text-[#E5A93C]">
                #{selectedPreviewShipment.aggregateId}
              </span>
            )}
          </div>

          {selectedPreviewShipment ? (
            <div className="space-y-4 text-xs font-sans">
              {/* Header Box */}
              <div className="bg-[#FAF9F5] dark:bg-[#141414] p-3.5 rounded-md border border-[#DDDCD6] dark:border-[#333333] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-base text-[#252525] dark:text-[#F5F5F0]">
                    #{selectedPreviewShipment.aggregateId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-bold ${selectedPreviewShipment.status === 'WARNING'
                      ? 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30'
                      : selectedPreviewShipment.status === 'DELIVERED'
                        ? 'bg-[#3F8F6B]/10 text-[#3F8F6B] border-[#3F8F6B]/30'
                        : 'bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 text-[#E56B2F] dark:text-[#E5A93C] border-[#E56B2F]/30 dark:border-[#E5A93C]/30'
                      }`}
                  >
                    {selectedPreviewShipment.status}
                  </span>
                </div>

                <div className="text-[11px] text-[#4A4A45] dark:text-[#9E9E98] space-y-1 pt-1 border-t border-[#DDDCD6]/60 dark:border-[#333333]/60">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E56B2F] dark:text-[#E5A93C] shrink-0" />
                    <span className="font-medium text-[#252525] dark:text-[#F5F5F0]">
                      {selectedPreviewShipment.currentLocation}
                    </span>
                  </div>
                  <div>
                    Carrier: <strong className="text-[#252525] dark:text-[#F5F5F0]">{selectedPreviewShipment.carrier}</strong>
                  </div>
                  {selectedPreviewShipment.vessel && (
                    <div>
                      Vessel: <strong className="text-[#252525] dark:text-[#F5F5F0]">{selectedPreviewShipment.vessel}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Forensic Stream Stats */}
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="bg-[#FAF9F5] dark:bg-[#141414] p-2.5 rounded border border-[#DDDCD6] dark:border-[#333333]">
                  <span className="text-[#888888] block text-[10px]">Head Version</span>
                  <span className="font-bold text-[#E56B2F] dark:text-[#E5A93C] text-sm">
                    v{selectedPreviewShipment.latestVersion}
                  </span>
                </div>

                <div className="bg-[#FAF9F5] dark:bg-[#141414] p-2.5 rounded border border-[#DDDCD6] dark:border-[#333333]">
                  <span className="text-[#888888] block text-[10px]">Persisted Events</span>
                  <span className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm">
                    {selectedPreviewShipment.eventCount} events
                  </span>
                </div>
              </div>

              {/* Sensor Telemetry Highlight */}
              {selectedPreviewShipment.lastTemperature !== undefined && (
                <div className="p-3 bg-[#FAF9F5] dark:bg-[#141414] rounded-md border border-[#DDDCD6] dark:border-[#333333] flex items-center justify-between font-mono text-xs">
                  <span className="text-[#888888]">Cold Chain Sensor:</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${selectedPreviewShipment.lastTemperature > 25 || selectedPreviewShipment.lastTemperature < -15
                      ? 'text-[#C94A4A]'
                      : 'text-[#3F8F6B]'
                      }`}
                  >
                    <ThermometerSnowflake className="w-3.5 h-3.5" />
                    {selectedPreviewShipment.lastTemperature}°C
                  </span>
                </div>
              )}

              {/* Action: Open Full Audit Trail */}
              <button
                onClick={() => navigate(`/shipments/${selectedPreviewShipment.aggregateId}`)}
                className="w-full py-2.5 bg-[#252525] dark:bg-[#E5A93C] text-white dark:text-[#141414] hover:opacity-90 transition-opacity rounded-md text-xs font-bold flex items-center justify-center gap-2 shadow-xs font-sans"
              >
                <span>Open Full Audit Trail &amp; Sensor Chart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#888888]">
              Select a shipment from the overview table to inspect.
            </div>
          )}
        </div>
      </div>

      {/* Global Activity Timeline Rail */}
      <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#E56B2F] dark:text-[#E5A93C]" />
            <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm">
              Global Ledger Event Stream (Recent Activity)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#6B6B66] dark:text-[#9E9E98]">
            Real-time Immutable Activity Log
          </span>
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
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/shipments/${ev.aggregateId}`)}
                  className={`cursor-pointer px-3.5 py-2.5 rounded-md border transition-all flex items-center justify-between gap-3 text-xs font-mono group ${isWarning
                    ? 'bg-[#C94A4A]/5 border-[#C94A4A]/30 hover:bg-[#C94A4A]/10'
                    : 'bg-[#FAF9F5] dark:bg-[#141414] border-[#DDDCD6] dark:border-[#333333] hover:bg-[#F5F4EE] dark:hover:bg-[#1C1C1C]'
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="font-bold text-[#E56B2F] dark:text-[#E5A93C] bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 px-2 py-0.5 rounded border border-[#E56B2F]/25 dark:border-[#E5A93C]/25 text-[11px] shrink-0">
                      #{ev.aggregateId}
                    </span>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold shrink-0 ${isWarning
                        ? 'bg-[#C94A4A]/15 text-[#C94A4A] border-[#C94A4A]/40'
                        : ev.eventType === 'DELIVERED'
                          ? 'bg-[#3F8F6B]/15 text-[#3F8F6B] border-[#3F8F6B]/40'
                          : 'bg-white dark:bg-[#222222] text-[#252525] dark:text-[#F5F5F0] border-[#DDDCD6] dark:border-[#3A3A3A]'
                        }`}
                    >
                      {ev.eventType}
                    </span>

                    <span className="font-mono text-[10px] text-[#888888] shrink-0">
                      v{ev.version}
                    </span>

                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#4A4A45] dark:text-[#CCCCCC] truncate">
                      {locationText && (
                        <>
                          <MapPin className="w-3 h-3 text-[#E56B2F] dark:text-[#E5A93C] shrink-0" />
                          <span className="truncate">{locationText}</span>
                        </>
                      )}
                      {ev.payload?.temperature !== undefined && (
                        <span className={`font-bold ml-2 ${isWarning ? 'text-[#C94A4A]' : 'text-[#3F8F6B]'}`}>
                          {ev.payload.temperature}°C
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-[#888888] shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>
                      {ev.timestamp
                        ? new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'N/A'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#888888] group-hover:text-[#E56B2F] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-[#888888]">No recent events recorded.</div>
          )}
        </div>
      </div>
    </div>
  );
};
