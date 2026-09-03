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
      <div className="p-12 text-center text-xs font-mono text-slate-400">
        Loading aggregate event stream for <span className="text-teal-400 font-bold">{id}</span>...
      </div>
    );
  }

  if (error || !selectedShipment) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 max-w-xl mx-auto mt-8">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-100">Shipment Aggregate Not Found</h2>
        <p className="text-xs text-slate-400 font-mono">
          {error || `No event stream exists in the database for shipment ID "${id}".`}
        </p>
        <button
          onClick={() => navigate('/shipments')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-mono transition-colors inline-flex items-center gap-2"
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
        className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shipments Directory</span>
      </button>

      {/* Aggregate Header Card */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-teal-300 font-mono">
                #{selectedShipment.aggregateId}
              </h1>
              <span
                className={`px-3 py-1 rounded-lg border text-xs font-bold font-mono ${
                  selectedShipment.status === 'WARNING'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : selectedShipment.status === 'DELIVERED'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                }`}
              >
                {selectedShipment.status}
              </span>
              <span className="bg-slate-800 text-amber-400 text-xs px-2.5 py-1 rounded-lg font-mono border border-slate-700 font-bold">
                Stream Version #{selectedShipment.latestVersion || 1}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono mt-1">
              Carrier: <span className="text-slate-200 font-semibold">{selectedShipment.carrier}</span>{' '}
              • Vessel: <span className="text-slate-200 font-semibold">{selectedShipment.vessel || 'N/A'}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-md shadow-teal-900/30 font-mono flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch CQRS Command</span>
            </button>
          </div>
        </div>

        {/* Route Progress bar / Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <div className="text-slate-500 mb-1">Port of Origin</div>
            <div className="font-semibold text-slate-200">{selectedShipment.origin}</div>
          </div>

          <div>
            <div className="text-slate-500 mb-1">Port of Destination</div>
            <div className="font-semibold text-slate-200">{selectedShipment.destination}</div>
          </div>

          <div>
            <div className="text-slate-500 mb-1">Current Location</div>
            <div className="font-semibold text-teal-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate">{selectedShipment.currentLocation}</span>
            </div>
          </div>

          <div>
            <div className="text-slate-500 mb-1">Telemetry Status</div>
            <div className="font-semibold text-slate-200 flex items-center gap-1">
              {selectedShipment.lastTemperature !== undefined ? (
                <span
                  className={`flex items-center gap-1 ${
                    selectedShipment.lastTemperature > 30 || selectedShipment.lastTemperature < -10
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-200'
                  }`}
                >
                  <ThermometerSnowflake className="w-3.5 h-3.5" />
                  {selectedShipment.lastTemperature}°C
                </span>
              ) : (
                <span className="text-slate-500">Normal Range</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Chronological Immutable Event Timeline */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" />
              <h2 className="font-bold text-slate-100 text-base">Immutable Event Store Stream</h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Append-Only Ledger Stream • {safeEvents.length} Historical Events Persisted
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
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
