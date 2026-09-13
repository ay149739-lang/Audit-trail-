import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Ship,
  MapPin,
  Clock,
  Send,
  Lock,
  ThermometerSnowflake,
  ShieldCheck,
  PackageCheck,
  AlertTriangle,
  RotateCcw,
  History,
  SlidersHorizontal,
} from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';
import { EventTimeline } from '../components/EventTimeline';
import { EventPayloadModal } from '../components/EventPayloadModal';
import { RecordEventModal } from '../components/RecordEventModal';
import { TechTerm } from '../components/TechTerm';
import { IEvent } from '../types';

export const ShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedShipment,
    liveShipment,
    isHistoricalView,
    selectedVersion,
    fetchShipmentById,
    fetchShipmentStateAt,
    resetToLiveState,
    isLoading,
    error,
  } = useShipmentStore();

  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState<number>(1);

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

  const handleSliderChange = (newVal: number) => {
    setSliderValue(newVal);
    if (!id) return;
    if (newVal === maxVersion) {
      resetToLiveState();
    } else {
      fetchShipmentStateAt(id.toUpperCase(), newVal);
    }
  };

  if (isLoading && !selectedShipment) {
    return (
      <div className="p-12 text-center text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98]">
        Loading aggregate event stream for <span className="text-[#E56B2F] dark:text-[#E5A93C] font-bold">{id}</span>...
      </div>
    );
  }

  if (error || !selectedShipment) {
    return (
      <div className="p-8 bg-white dark:bg-[#1F1F1F] border border-[#DDDCD6] dark:border-[#333333] rounded-md text-center space-y-4 max-w-xl mx-auto mt-8 font-mono shadow-sm">
        <AlertTriangle className="w-10 h-10 text-[#D9A441] dark:text-[#E5A93C] mx-auto" />
        <h2 className="text-lg font-bold text-[#252525] dark:text-[#F5F5F0]">Shipment Aggregate Not Found</h2>
        <p className="text-xs text-[#6B6B66] dark:text-[#9E9E98]">
          {error || `No event stream exists in the database for shipment ID "${id}".`}
        </p>
        <button
          onClick={() => navigate('/shipments')}
          className="bg-[#252525] hover:bg-[#333333] dark:bg-[#E5A93C] dark:hover:bg-[#D49A2A] text-white dark:text-[#141414] px-4 py-2 rounded-md text-xs font-bold transition-colors inline-flex items-center gap-2 font-mono focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shipments Directory</span>
        </button>
      </div>
    );
  }

  const safeEvents = Array.isArray(selectedShipment.events) ? selectedShipment.events : [];

  return (
    <div className="space-y-6 animate-fadeIn transition-colors">
      {/* Top Navigation & Rewind Indicator Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/shipments')}
          className="text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0] flex items-center gap-1.5 transition-colors font-semibold focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none rounded px-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shipments Directory</span>
        </button>

        {isHistoricalView && (
          <div className="flex items-center gap-2 bg-[#D9A441]/10 dark:bg-[#E5A93C]/10 border border-[#D9A441]/30 dark:border-[#E5A93C]/30 px-3 py-1.5 rounded text-xs font-mono text-[#D9A441] dark:text-[#E5A93C]">
            <History className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-bold">HISTORICAL STATE REWIND (READ-ONLY) • VERSION #{selectedVersion}</span>
            <button
              onClick={resetToLiveState}
              className="ml-2 bg-[#252525] dark:bg-[#E5A93C] text-white dark:text-[#141414] px-2 py-0.5 rounded text-[11px] font-bold hover:opacity-90 transition-opacity flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore Live</span>
            </button>
          </div>
        )}
      </div>

      {/* Aggregate Header Card */}
      <div className="bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] space-y-6 shadow-sm relative overflow-hidden">
        {isHistoricalView && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D9A441] via-[#E5A93C] to-[#E56B2F]" />
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#E56B2F] dark:text-[#E5A93C] font-mono">
                #{selectedShipment.aggregateId}
              </h1>
              <span
                className={`px-3 py-1 rounded border text-xs font-bold font-mono ${
                  selectedShipment.status === 'WARNING'
                    ? 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30'
                    : selectedShipment.status === 'DELIVERED'
                    ? 'bg-[#3F8F6B]/10 text-[#3F8F6B] border-[#3F8F6B]/30'
                    : 'bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 text-[#E56B2F] dark:text-[#E5A93C] border-[#E56B2F]/30 dark:border-[#E5A93C]/30'
                }`}
              >
                {selectedShipment.status}
              </span>
              <span className="bg-[#FAF9F5] dark:bg-[#141414] text-[#D9A441] dark:text-[#E5A93C] text-xs px-2.5 py-1 rounded font-mono border border-[#DDDCD6] dark:border-[#333333] font-bold">
                {isHistoricalView ? `Historical State v#${selectedVersion}` : `Live Stream Version #${selectedShipment.latestVersion || 1}`}
              </span>
            </div>

            <p className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono mt-1">
              Carrier: <span className="text-[#252525] dark:text-[#F5F5F0] font-semibold">{selectedShipment.carrier}</span>{' '}
              • Vessel: <span className="text-[#252525] dark:text-[#F5F5F0] font-semibold">{selectedShipment.vessel || 'N/A'}</span>
            </p>
          </div>

          {/* Standardized Primary Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#E56B2F] hover:bg-[#D45A1E] dark:bg-[#E5A93C] dark:hover:bg-[#D49A2A] text-white dark:text-[#141414] px-3.5 py-2 rounded-md text-xs font-bold font-mono transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch CQRS Command</span>
            </button>
          </div>
        </div>

        {/* Route Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#FAF9F5] dark:bg-[#141414] p-4 rounded-md border border-[#DDDCD6] dark:border-[#333333] font-mono text-xs">
          <div>
            <div className="text-[#6B6B66] dark:text-[#9E9E98] mb-1">Port of Origin</div>
            <div className="font-semibold text-[#252525] dark:text-[#F5F5F0]">{selectedShipment.origin}</div>
          </div>

          <div>
            <div className="text-[#6B6B66] dark:text-[#9E9E98] mb-1">Port of Destination</div>
            <div className="font-semibold text-[#252525] dark:text-[#F5F5F0]">{selectedShipment.destination}</div>
          </div>

          <div>
            <div className="text-[#6B6B66] dark:text-[#9E9E98] mb-1">
              {isHistoricalView ? 'Historical Location' : 'Current Location'}
            </div>
            <div className="font-semibold text-[#E56B2F] dark:text-[#E5A93C] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#E56B2F] dark:text-[#E5A93C] shrink-0" />
              <span className="truncate">{selectedShipment.currentLocation}</span>
            </div>
          </div>

          <div>
            <div className="text-[#6B6B66] dark:text-[#9E9E98] mb-1">Telemetry Status</div>
            <div className="font-semibold text-[#252525] dark:text-[#F5F5F0] flex items-center gap-1">
              {selectedShipment.lastTemperature !== undefined ? (
                <span
                  className={`flex items-center gap-1 ${
                    selectedShipment.lastTemperature > 30 || selectedShipment.lastTemperature < -10
                      ? 'text-[#C94A4A] font-bold'
                      : 'text-[#252525] dark:text-[#F5F5F0]'
                  }`}
                >
                  <ThermometerSnowflake className="w-3.5 h-3.5" />
                  {selectedShipment.lastTemperature}°C
                </span>
              ) : (
                <span className="text-[#6B6B66] dark:text-[#9E9E98]">Normal Range</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Week 3 State Scrubbing / Rewind Time Slider Control Card */}
      <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#E56B2F] dark:text-[#E5A93C]" />
            <h2 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm font-sans">
              State Scrubbing / Rewind Time Slider
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#6B6B66] dark:text-[#9E9E98]">
            <span>Event Version:</span>
            <span className="bg-[#FAF9F5] dark:bg-[#141414] text-[#E56B2F] dark:text-[#E5A93C] font-bold px-2 py-0.5 rounded border border-[#DDDCD6] dark:border-[#333333]">
              #{sliderValue} / #{maxVersion}
            </span>
          </div>
        </div>

        {/* Range Input Slider */}
        <div className="space-y-2">
          <input
            type="range"
            aria-label="Rewind time slider"
            min={1}
            max={maxVersion}
            step={1}
            value={sliderValue}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-2 bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-lg appearance-none cursor-pointer accent-[#E56B2F] dark:accent-[#E5A93C] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C]"
          />

          <div className="flex justify-between text-[11px] font-mono text-[#6B6B66] dark:text-[#9E9E98]">
            <span>v1 (Created)</span>
            <span>v{maxVersion} (Latest Live)</span>
          </div>
        </div>
      </div>

      {/* Main Section: Chronological Immutable Event Timeline */}
      <div className="bg-white dark:bg-[#1F1F1F] p-6 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#DDDCD6] dark:border-[#333333] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E56B2F] dark:text-[#E5A93C]" />
              <h2 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-base font-sans">
                Immutable Event Store Stream
              </h2>
            </div>
            <p className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono mt-0.5">
              Append-Only Ledger Stream • {safeEvents.length} Historical Events Persisted
            </p>
          </div>

          <div className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono bg-[#FAF9F5] dark:bg-[#141414] px-3 py-1.5 rounded border border-[#DDDCD6] dark:border-[#333333]">
            Click any event to inspect full JSON payload
          </div>
        </div>

        {/* Timeline Visualization */}
        <EventTimeline
          events={safeEvents}
          onSelectEvent={(event) => setSelectedEvent(event)}
        />
      </div>

      {/* Modals */}
      <EventPayloadModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      <RecordEventModal
        aggregateId={selectedShipment.aggregateId}
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
      />
    </div>
  );
};
