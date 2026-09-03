import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';
import { EventTimeline } from '../components/EventTimeline';
import { EventPayloadModal } from '../components/EventPayloadModal';
import { RecordEventModal } from '../components/RecordEventModal';
import { IEvent } from '../types';

export const ShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedShipment, fetchShipmentById, isLoading, error } = useShipmentStore();

  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchShipmentById(id.toUpperCase());
    }
  }, [id, fetchShipmentById]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-[#6B6B66]">
        Loading aggregate event stream for <span className="text-[#E56B2F] font-bold">{id}</span>...
      </div>
    );
  }

  if (error || !selectedShipment) {
    return (
      <div className="p-8 bg-white border border-[#DDDCD6] rounded-md text-center space-y-4 max-w-xl mx-auto mt-8 font-mono shadow-sm">
        <AlertTriangle className="w-10 h-10 text-[#D9A441] mx-auto" />
        <h2 className="text-lg font-bold text-[#252525]">Shipment Aggregate Not Found</h2>
        <p className="text-xs text-[#6B6B66]">
          {error || `No event stream exists in the database for shipment ID "${id}".`}
        </p>
        <button
          onClick={() => navigate('/shipments')}
          className="bg-[#252525] hover:bg-[#333333] text-white px-4 py-2 rounded text-xs transition-colors inline-flex items-center gap-2 font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shipments Directory</span>
        </button>
      </div>
    );
  }

  const safeEvents = Array.isArray(selectedShipment.events) ? selectedShipment.events : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/shipments')}
        className="text-xs font-mono text-[#6B6B66] hover:text-[#252525] flex items-center gap-1.5 transition-colors font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shipments Directory</span>
      </button>

      {/* Aggregate Header Card */}
      <div className="bg-white p-6 rounded-md border border-[#DDDCD6] space-y-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#E56B2F] font-mono">
                #{selectedShipment.aggregateId}
              </h1>
              <span
                className={`px-3 py-1 rounded border text-xs font-bold font-mono ${
                  selectedShipment.status === 'WARNING'
                    ? 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30'
                    : selectedShipment.status === 'DELIVERED'
                    ? 'bg-[#3F8F6B]/10 text-[#3F8F6B] border-[#3F8F6B]/30'
                    : 'bg-[#E56B2F]/10 text-[#E56B2F] border-[#E56B2F]/30'
                }`}
              >
                {selectedShipment.status}
              </span>
              <span className="bg-[#FAF9F5] text-[#D9A441] text-xs px-2.5 py-1 rounded font-mono border border-[#DDDCD6] font-bold">
                Stream Version #{selectedShipment.latestVersion || 1}
              </span>
            </div>

            <p className="text-xs text-[#6B6B66] font-mono mt-1">
              Carrier: <span className="text-[#252525] font-semibold">{selectedShipment.carrier}</span>{' '}
              • Vessel: <span className="text-[#252525] font-semibold">{selectedShipment.vessel || 'N/A'}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="bg-[#E56B2F] hover:bg-[#D45A1E] text-white px-4 py-2 rounded-md text-xs font-semibold transition-all shadow-sm font-mono flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch CQRS Command</span>
            </button>
          </div>
        </div>

        {/* Route Progress bar / Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#FAF9F5] p-4 rounded-md border border-[#DDDCD6] font-mono text-xs">
          <div>
            <div className="text-[#6B6B66] mb-1">Port of Origin</div>
            <div className="font-semibold text-[#252525]">{selectedShipment.origin}</div>
          </div>

          <div>
            <div className="text-[#6B6B66] mb-1">Port of Destination</div>
            <div className="font-semibold text-[#252525]">{selectedShipment.destination}</div>
          </div>

          <div>
            <div className="text-[#6B6B66] mb-1">Current Location</div>
            <div className="font-semibold text-[#E56B2F] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#E56B2F] shrink-0" />
              <span className="truncate">{selectedShipment.currentLocation}</span>
            </div>
          </div>

          <div>
            <div className="text-[#6B6B66] mb-1">Telemetry Status</div>
            <div className="font-semibold text-[#252525] flex items-center gap-1">
              {selectedShipment.lastTemperature !== undefined ? (
                <span
                  className={`flex items-center gap-1 ${
                    selectedShipment.lastTemperature > 30 || selectedShipment.lastTemperature < -10
                      ? 'text-[#C94A4A] font-bold'
                      : 'text-[#252525]'
                  }`}
                >
                  <ThermometerSnowflake className="w-3.5 h-3.5" />
                  {selectedShipment.lastTemperature}°C
                </span>
              ) : (
                <span className="text-[#6B6B66]">Normal Range</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Chronological Immutable Event Timeline */}
      <div className="bg-white p-6 rounded-md border border-[#DDDCD6] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#DDDCD6] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E56B2F]" />
              <h2 className="font-bold text-[#252525] text-base font-sans">Immutable Event Store Stream</h2>
            </div>
            <p className="text-xs text-[#6B6B66] font-mono mt-0.5">
              Append-Only Ledger Stream • {safeEvents.length} Historical Events Persisted
            </p>
          </div>

          <div className="text-xs text-[#6B6B66] font-mono bg-[#FAF9F5] px-3 py-1.5 rounded border border-[#DDDCD6]">
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
