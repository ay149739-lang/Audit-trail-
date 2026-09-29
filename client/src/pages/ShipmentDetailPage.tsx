import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Ship,
  MapPin,
  Clock,
  Send,
  Lock,
  ThermometerSnowflake,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  History,
  SlidersHorizontal,
  Radio,
  Layers,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';
import { EventTimeline } from '../components/EventTimeline';
import { EventDetailsPanel } from '../components/EventDetailsPanel';
import { SensorTelemetryChart } from '../components/SensorTelemetryChart';
import { ConcurrencyConflictModal } from '../components/ConcurrencyConflictModal';
import { RecordEventModal } from '../components/RecordEventModal';
import { RouteMilestoneProgress } from '../components/RouteMilestoneProgress';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { IEvent } from '../types';

export const ShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedShipment,
    liveShipment,
    isHistoricalView,
    selectedVersion,
    concurrencyConflict,
    clearConcurrencyConflict,
    refreshShipment,
    fetchShipmentById,
    fetchShipmentStateAt,
    resetToLiveState,
    isLoading,
    error,
  } = useShipmentStore();

  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState<number>(1);
  const debounceTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (id) {
      fetchShipmentById(id.toUpperCase());
    }
  }, [id, fetchShipmentById]);

  // Sync sliderValue with selectedVersion or liveShipment latestVersion
  useEffect(() => {
    if (selectedVersion !== null && selectedVersion !== undefined) {
      setSliderValue(selectedVersion);
    } else if (liveShipment?.latestVersion) {
      setSliderValue(liveShipment.latestVersion);
    }
  }, [selectedVersion, liveShipment?.latestVersion]);

  const maxVersion = liveShipment?.latestVersion || selectedShipment?.latestVersion || 1;
  const safeEvents = Array.isArray(liveShipment?.events || selectedShipment?.events)
    ? (liveShipment?.events || selectedShipment?.events)!
    : [];

  // Default selected event for the inspector to the current cutoff or latest event
  useEffect(() => {
    if (safeEvents.length > 0 && !selectedEvent) {
      const defaultEvent =
        safeEvents.find((e) => e.version === (selectedVersion || maxVersion)) ||
        safeEvents[safeEvents.length - 1];
      setSelectedEvent(defaultEvent);
    }
  }, [safeEvents, selectedEvent, selectedVersion, maxVersion]);

  const handleSliderChange = (newVal: number, immediate: boolean = false) => {
    setSliderValue(newVal);

    // Auto-select corresponding event in inspector immediately
    const matchingEvent = safeEvents.find((e) => e.version === newVal);
    if (matchingEvent) {
      setSelectedEvent(matchingEvent);
    }

    if (!id) return;

    if (newVal >= maxVersion) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      resetToLiveState();
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (immediate) {
      fetchShipmentStateAt(id.toUpperCase(), newVal);
    } else {
      debounceTimerRef.current = setTimeout(() => {
        fetchShipmentStateAt(id.toUpperCase(), newVal);
      }, 90);
    }
  };

  const handleSelectEvent = (event: IEvent) => {
    setSelectedEvent(event);
  };

  // Zero-jump skeleton loading state
  if (isLoading && !selectedShipment) {
    return (
      <div className="space-y-6 animate-fadeIn font-mono">
        <div className="h-6 w-48 bg-[#FAF9F5] dark:bg-[#262626] rounded animate-pulse"></div>

        {/* Header Card Skeleton */}
        <div className="bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 w-40 bg-[#FAF9F5] dark:bg-[#262626] rounded animate-pulse"></div>
              <div className="h-4 w-60 bg-[#FAF9F5] dark:bg-[#262626] rounded animate-pulse"></div>
            </div>
            <div className="h-9 w-32 bg-[#FAF9F5] dark:bg-[#262626] rounded animate-pulse"></div>
          </div>
          <div className="h-28 bg-[#FAF9F5] dark:bg-[#1A1A1A] rounded animate-pulse"></div>
        </div>

        {/* Scrubber Skeleton */}
        <div className="bg-white dark:bg-[#1F1F1F] p-4 rounded-md border border-[#DDDCD6] dark:border-[#333333] h-20 animate-pulse"></div>

        {/* Chart Skeleton */}
        <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] h-64 animate-pulse"></div>

        {/* Master Detail Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] h-80 animate-pulse"></div>
          <div className="lg:col-span-5 bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] h-80 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Error State with in-place Retry button
  if (error && !concurrencyConflict && !selectedShipment) {
    return (
      <div className="p-8 bg-white dark:bg-[#1F1F1F] border border-[#DDDCD6] dark:border-[#333333] rounded-md text-center space-y-4 max-w-xl mx-auto mt-8 font-sans shadow-sm animate-fadeIn">
        <AlertTriangle className="w-10 h-10 text-[#D9A441] dark:text-[#E5A93C] mx-auto" />
        <h2 className="text-lg font-bold text-[#252525] dark:text-[#F5F5F0]">Unable to Load Shipment Stream</h2>
        <p className="text-xs text-[#6B6B66] dark:text-[#9E9E98] max-w-md mx-auto font-mono">
          {error || `No event stream found in Event Store for shipment ID "${id}".`}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {id && (
            <PrimaryButton
              icon={RotateCcw}
              onClick={() => fetchShipmentById(id.toUpperCase())}
            >
              Retry Query
            </PrimaryButton>
          )}
          <SecondaryButton
            icon={ArrowLeft}
            onClick={() => navigate('/shipments')}
          >
            Return to Directory
          </SecondaryButton>
        </div>
      </div>
    );
  }

  if (!selectedShipment) return null;

  return (
    <div className="space-y-6 animate-fadeIn transition-colors font-sans">
      {/* Top Navigation & Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/shipments')}
          className="text-xs text-[#4A4A45] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0] flex items-center gap-1.5 transition-colors font-semibold focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none rounded px-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shipments Directory</span>
        </button>

        {isHistoricalView ? (
          <div className="inline-flex items-center gap-2 bg-[#D9A441]/10 dark:bg-[#E5A93C]/10 border border-[#D9A441]/30 dark:border-[#E5A93C]/30 px-3 py-1.5 rounded text-xs font-mono text-[#D9A441] dark:text-[#E5A93C]">
            <History className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-bold">HISTORICAL REWIND ACTIVE • v{selectedVersion} of v{maxVersion}</span>
            <button
              onClick={resetToLiveState}
              className="ml-2 bg-[#252525] dark:bg-[#E5A93C] text-white dark:text-[#141414] px-2.5 py-1 rounded text-[11px] font-bold hover:opacity-90 transition-opacity flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none shadow-xs font-sans"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore Live</span>
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3F8F6B] bg-[#3F8F6B]/10 border border-[#3F8F6B]/20 px-3 py-1.5 rounded">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-bold">LIVE CURRENT STATE • HEAD v{maxVersion}</span>
          </div>
        )}
      </div>

      {/* Aggregate Header Card (Enterprise Logistics Command Center) */}
      <div className="bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] space-y-5 shadow-sm relative overflow-hidden">
        {isHistoricalView && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D9A441] via-[#E5A93C] to-[#E56B2F]" />
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-[#E56B2F] dark:text-[#E5A93C] font-mono">
                #{selectedShipment.aggregateId}
              </h1>
              <span
                className={`px-2.5 py-1 rounded border text-xs font-bold font-mono ${selectedShipment.status === 'WARNING'
                  ? 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30'
                  : selectedShipment.status === 'DELIVERED'
                    ? 'bg-[#3F8F6B]/10 text-[#3F8F6B] border-[#3F8F6B]/30'
                    : 'bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 text-[#E56B2F] dark:text-[#E5A93C] border-[#E56B2F]/30 dark:border-[#E5A93C]/30'
                  }`}
              >
                {selectedShipment.status}
              </span>

              <span className="bg-[#FAF9F5] dark:bg-[#141414] text-[#D9A441] dark:text-[#E5A93C] text-xs px-2.5 py-1 rounded font-mono border border-[#DDDCD6] dark:border-[#333333] font-bold">
                {isHistoricalView ? `State at v#${selectedVersion}` : `Live Version v#${selectedShipment.latestVersion || 1}`}
              </span>

              {/* Prominent Telemetry Badge */}
              {selectedShipment.lastTemperature !== undefined && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded border ${selectedShipment.lastTemperature > 25 || selectedShipment.lastTemperature < -15
                    ? 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30 font-bold'
                    : 'bg-[#FAF9F5] dark:bg-[#141414] text-[#252525] dark:text-[#F5F5F0] border-[#DDDCD6] dark:border-[#333333]'
                    }`}
                >
                  <ThermometerSnowflake className="w-3.5 h-3.5" />
                  <span>{selectedShipment.lastTemperature}°C</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#4A4A45] dark:text-[#9E9E98] font-sans">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E56B2F] dark:text-[#E5A93C]" />
                Current Location:{' '}
                <strong className="text-[#252525] dark:text-[#F5F5F0]">
                  {selectedShipment.currentLocation}
                </strong>
              </span>
              <span>•</span>
              <span>
                Carrier: <strong className="text-[#252525] dark:text-[#F5F5F0]">{selectedShipment.carrier}</strong>
              </span>
              <span>•</span>
              <span>
                Vessel: <strong className="text-[#252525] dark:text-[#F5F5F0]">{selectedShipment.vessel || 'N/A'}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isHistoricalView ? (
              <div className="h-9 px-3.5 py-2 rounded-md text-xs font-medium text-[#4A4A45] dark:text-[#9E9E98] bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] flex items-center gap-1.5 cursor-not-allowed font-sans">
                <Lock className="w-3.5 h-3.5" />
                <span>Writes Disabled in Historical Mode</span>
              </div>
            ) : (
              <PrimaryButton
                icon={Send}
                onClick={() => setIsRecordModalOpen(true)}
              >
                Dispatch Shipment Command
              </PrimaryButton>
            )}
          </div>
        </div>

        {/* 5-Metric Operational Command Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 font-mono text-xs">
          <div className="bg-[#FAF9F5] dark:bg-[#141414] p-3 rounded-md border border-[#DDDCD6] dark:border-[#333333]">
            <span className="text-[10px] text-[#888888] uppercase block tracking-wider font-semibold">SHIPMENT</span>
            <span className="text-base font-bold text-[#E56B2F] dark:text-[#E5A93C]">#{selectedShipment.aggregateId}</span>
          </div>

          <div className="bg-[#FAF9F5] dark:bg-[#141414] p-3 rounded-md border border-[#DDDCD6] dark:border-[#333333]">
            <span className="text-[10px] text-[#888888] uppercase block tracking-wider font-semibold">STATUS</span>
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${selectedShipment.status === 'WARNING'
              ? 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30'
              : selectedShipment.status === 'DELIVERED'
                ? 'bg-[#3F8F6B]/10 text-[#3F8F6B] border-[#3F8F6B]/30'
                : 'bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 text-[#E56B2F] dark:text-[#E5A93C] border-[#E56B2F]/30 dark:border-[#E5A93C]/30'
              }`}>
              {selectedShipment.status}
            </span>
          </div>

          <div className="bg-[#FAF9F5] dark:bg-[#141414] p-3 rounded-md border border-[#DDDCD6] dark:border-[#333333] col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[#888888] uppercase block tracking-wider font-semibold">LOCATION</span>
            <span className="text-xs font-bold text-[#252525] dark:text-[#F5F5F0] truncate block mt-0.5">
              {selectedShipment.currentLocation}
            </span>
          </div>

          <div className="bg-[#FAF9F5] dark:bg-[#141414] p-3 rounded-md border border-[#DDDCD6] dark:border-[#333333]">
            <span className="text-[10px] text-[#888888] uppercase block tracking-wider font-semibold">VERSION</span>
            <span className="text-base font-bold text-[#D9A441] dark:text-[#E5A93C]">
              v{isHistoricalView ? selectedVersion : (selectedShipment.latestVersion || 1)}
            </span>
          </div>

          <div className="bg-[#FAF9F5] dark:bg-[#141414] p-3 rounded-md border border-[#DDDCD6] dark:border-[#333333]">
            <span className="text-[10px] text-[#888888] uppercase block tracking-wider font-semibold">EVENTS</span>
            <span className="text-base font-bold text-[#252525] dark:text-[#F5F5F0]">
              {safeEvents.length}
            </span>
          </div>
        </div>

        {/* Executive Route Milestone Progress */}
        <RouteMilestoneProgress
          shipment={selectedShipment}
          isHistorical={isHistoricalView}
        />
      </div>

      {/* Historical State Scrubber Bar */}
      <div className="bg-white dark:bg-[#1F1F1F] p-4 rounded-lg border border-[#DDDCD6] dark:border-[#333333] shadow-elev-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#E56B2F] dark:text-[#E5A93C]" />
            <span className="font-bold text-xs text-[#252525] dark:text-[#F5F5F0] font-sans">
              Historical State Scrubber
            </span>
            <span className="text-[11px] text-[#4A4A45] dark:text-[#9E9E98] font-sans">
              (Deterministic event replay fold up to cutoff version)
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#4A4A45] dark:text-[#9E9E98]">
            <span className="font-sans">Cutoff Position:</span>
            <span className="bg-[#FAF9F5] dark:bg-[#141414] text-[#E56B2F] dark:text-[#E5A93C] font-bold px-2 py-0.5 rounded border border-[#DDDCD6] dark:border-[#333333]">
              v{sliderValue} / v{maxVersion}
            </span>
          </div>
        </div>

        {/* Range Slider Track */}
        <div className="space-y-1.5">
          <input
            type="range"
            role="slider"
            aria-label="Historical event version scrubber"
            aria-valuenow={sliderValue}
            aria-valuemin={1}
            aria-valuemax={maxVersion}
            aria-valuetext={`Version ${sliderValue} of ${maxVersion}`}
            min={1}
            max={maxVersion}
            step={1}
            value={sliderValue}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                if (sliderValue < maxVersion) handleSliderChange(sliderValue + 1, true);
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                if (sliderValue > 1) handleSliderChange(sliderValue - 1, true);
              }
            }}
            className="w-full h-2.5 bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-lg appearance-none cursor-pointer accent-[#E56B2F] dark:accent-[#E5A93C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C]"
          />

          <div className="flex justify-between text-[11px] font-mono text-[#4A4A45] dark:text-[#9E9E98]">
            <button
              onClick={() => handleSliderChange(1, true)}
              className="hover:text-[#E56B2F] dark:hover:text-[#E5A93C] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] rounded px-1"
            >
              v1 (Container Created)
            </button>
            <button
              onClick={() => handleSliderChange(maxVersion, true)}
              className="hover:text-[#E56B2F] dark:hover:text-[#E5A93C] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] rounded px-1"
            >
              v{maxVersion} (Live Head State)
            </button>
          </div>
        </div>
      </div>

      {/* SENSOR TELEMETRY & EVENT OVERLAY CHART (Recharts) */}
      <SensorTelemetryChart
        events={safeEvents}
        selectedEvent={selectedEvent}
        onSelectEvent={handleSelectEvent}
        aggregateId={selectedShipment.aggregateId}
        activeVersionCutoff={isHistoricalView ? (selectedVersion || 1) : undefined}
        height={260}
      />

      {/* MASTER-DETAIL SPLIT LAYOUT (~60% Event Ledger / ~40% Forensic Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE (~60%): Chronological Continuous Event Rail */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1F1F1F] p-5 rounded-lg border border-[#DDDCD6] dark:border-[#333333] shadow-elev-1 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#E56B2F] dark:text-[#E5A93C]" />
                <h2 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm font-sans">
                  Chronological Event Stream Ledger
                </h2>
              </div>
              <p className="text-xs text-[#4A4A45] dark:text-[#9E9E98] mt-0.5 font-sans">
                Append-Only Stream • {safeEvents.length} Total Events Persisted
              </p>
            </div>

            <div className="text-[11px] font-sans text-[#4A4A45] dark:text-[#9E9E98] bg-[#FAF9F5] dark:bg-[#141414] px-2.5 py-1 rounded border border-[#DDDCD6] dark:border-[#333333]">
              Click event or chart dot to inspect
            </div>
          </div>

          {/* Compact Continuous Event Timeline */}
          <EventTimeline
            events={safeEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={handleSelectEvent}
            activeVersionCutoff={isHistoricalView ? (selectedVersion || 1) : undefined}
            latestVersion={maxVersion}
          />
        </div>

        {/* RIGHT PANE (~40%): Persistent Forensic Event Inspector */}
        <div className="lg:col-span-5">
          <EventDetailsPanel
            event={selectedEvent || safeEvents[safeEvents.length - 1] || null}
            maxVersion={maxVersion}
            currentCutoffVersion={isHistoricalView ? selectedVersion || 1 : undefined}
            isHistorical={isHistoricalView}
            onRewindToEvent={(ver) => handleSliderChange(ver, true)}
          />
        </div>
      </div>

      {/* CQRS Command Dispatch Modal */}
      <RecordEventModal
        aggregateId={selectedShipment.aggregateId}
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
      />

      {/* Concurrency Conflict (OCC) Dialog */}
      <ConcurrencyConflictModal
        conflict={concurrencyConflict}
        onRefresh={async () => {
          if (id) {
            await refreshShipment(id.toUpperCase());
          }
          clearConcurrencyConflict();
        }}
        onClose={() => clearConcurrencyConflict()}
      />
    </div>
  );
};
