import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Send,
  Lock,
  ThermometerSnowflake,
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
      <div className="p-12 text-center text-xs font-mono text-[#8c909f]">
        Loading aggregate event stream for <span className="text-[#adc6ff] font-bold">{id}</span>...
      </div>
    );
  }

  if (error || !selectedShipment) {
    return (
      <div className="p-8 bg-[#122131] border border-[#1c2b3c] rounded text-center space-y-4 max-w-xl mx-auto mt-8 font-mono">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-[#d4e4fa]">Shipment Aggregate Not Found</h2>
        <p className="text-xs text-[#8c909f]">
          {error || `No event stream exists in the database for shipment ID "${id}".`}
        </p>
        <button
          onClick={() => navigate('/shipments')}
          className="bg-[#010f1f] border border-[#273647] hover:bg-[#1c2b3c] text-[#d4e4fa] px-4 py-2 rounded text-xs transition-colors inline-flex items-center gap-2"
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
        className="text-xs font-mono text-[#8c909f] hover:text-[#d4e4fa] flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shipments Directory</span>
      </button>

      {/* Aggregate Header Card */}
      <div className="bg-[#0d1c2d] p-6 rounded border border-[#1c2b3c] space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#adc6ff] font-mono">
                #{selectedShipment.aggregateId}
              </h1>
              <span
                className={`px-3 py-1 rounded border text-xs font-bold font-mono ${
                  selectedShipment.status === 'WARNING'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : selectedShipment.status === 'DELIVERED'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                }`}
              >
                [ {selectedShipment.status} ]
              </span>
              <span className="bg-[#010f1f] text-[#adc6ff] text-xs px-2.5 py-1 rounded font-mono border border-[#273647] font-bold">
                v{selectedShipment.latestVersion || 1}
              </span>
            </div>

            <p className="text-xs text-[#8c909f] font-mono mt-1">
              Carrier: <span className="text-[#d4e4fa] font-semibold">{selectedShipment.carrier}</span>{' '}
              • Vessel: <span className="text-[#d4e4fa] font-semibold">{selectedShipment.vessel || 'N/A'}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold px-4 py-2 rounded text-xs transition-all shadow font-mono flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch CQRS Command</span>
            </button>
          </div>
        </div>

        {/* Route Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#010f1f] p-4 rounded border border-[#1c2b3c] font-mono text-xs">
          <div>
            <div className="text-[#8c909f] mb-1">Port of Origin</div>
            <div className="font-semibold text-[#d4e4fa]">{selectedShipment.origin}</div>
          </div>

          <div>
            <div className="text-[#8c909f] mb-1">Port of Destination</div>
            <div className="font-semibold text-[#d4e4fa]">{selectedShipment.destination}</div>
          </div>

          <div>
            <div className="text-[#8c909f] mb-1">Current Location</div>
            <div className="font-semibold text-[#adc6ff] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#4d8eff] shrink-0" />
              <span className="truncate">{selectedShipment.currentLocation}</span>
            </div>
          </div>

          <div>
            <div className="text-[#8c909f] mb-1">Telemetry Status</div>
            <div className="font-semibold text-[#d4e4fa] flex items-center gap-1">
              {selectedShipment.lastTemperature !== undefined ? (
                <span
                  className={`flex items-center gap-1 ${
                    selectedShipment.lastTemperature > 30 || selectedShipment.lastTemperature < -10
                      ? 'text-amber-400 font-bold'
                      : 'text-[#d4e4fa]'
                  }`}
                >
                  <ThermometerSnowflake className="w-3.5 h-3.5" />
                  {selectedShipment.lastTemperature}°C
                </span>
              ) : (
                <span className="text-[#8c909f]">Normal Range</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Event Stream Section */}
      <div className="bg-[#122131] p-6 rounded border border-[#1c2b3c] space-y-6">
        <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#4d8eff]" />
              <h2 className="font-bold text-[#d4e4fa] text-base font-sans">Immutable Event Store Stream</h2>
            </div>
            <p className="text-xs text-[#8c909f] font-mono mt-0.5">
              Append-Only Ledger Stream • {safeEvents.length} Historical Events Persisted
            </p>
          </div>

          <div className="text-xs text-[#8c909f] font-mono bg-[#010f1f] px-3 py-1.5 rounded border border-[#1c2b3c]">
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
