import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Layers,
  ThermometerSun,
  Truck,
  PlusCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Box
} from 'lucide-react';
import { useShipmentStore } from '../../store/useShipmentStore';

export const StateSummaryCard = () => {
  const { currentState, events, searchedId, appendEvent, isAppending } = useShipmentStore();
  const [showAppendModal, setShowAppendModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState('TEMPERATURE_SPIKE');
  const [payloadJson, setPayloadJson] = useState('{\n  "currentTemp": 29.8,\n  "threshold": 22,\n  "sensorId": "REEFER-SENS-09",\n  "severity": "CRITICAL"\n}');
  const [formError, setFormError] = useState('');

  if (!currentState || !currentState.currentState) {
    return null;
  }

  const folded = currentState.currentState;
  const eventCount = currentState.eventCount || events?.length || 0;
  const lastUpdated = currentState.lastUpdated
    ? new Date(currentState.lastUpdated).toLocaleString()
    : 'Unknown';

  const handleAppendSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadJson);
    } catch (err) {
      setFormError('Invalid JSON format in payload.');
      return;
    }

    const success = await appendEvent(selectedEventType, parsedPayload);
    if (success) {
      setShowAppendModal(false);
    }
  };

  const presetPayloads = {
    TEMPERATURE_SPIKE: '{\n  "currentTemp": 29.8,\n  "threshold": 22,\n  "sensorId": "REEFER-SENS-09",\n  "severity": "CRITICAL",\n  "notes": "Emergency refrigeration diagnostic check recommended."\n}',
    LOADED_ON_SHIP: '{\n  "vesselName": "M/V Atlantic Star",\n  "port": "Port of Shanghai",\n  "seaRoute": "North-Pacific Shipping Lane"\n}',
    ARRIVED_AT_PORT: '{\n  "port": "Port of Long Beach",\n  "terminal": "Pier T Gate 4",\n  "berth": "Berth 12"\n}',
    CUSTOMS_CLEARED: '{\n  "customOffice": "US Customs & Border Protection",\n  "clearanceId": "CLR-PASSED-9921",\n  "status": "APPROVED"\n}'
  };

  const handleTypeSelect = (type) => {
    setSelectedEventType(type);
    if (presetPayloads[type]) {
      setPayloadJson(presetPayloads[type]);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CUSTOMS_CLEARED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> CUSTOMS CLEARED
          </span>
        );
      case 'ARRIVED_AT_PORT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
            <MapPin className="w-3.5 h-3.5" /> ARRIVED AT PORT
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
            <Truck className="w-3.5 h-3.5 animate-pulse" /> IN TRANSIT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
            <Box className="w-3.5 h-3.5" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Main State Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 transition-all">
        
        {/* Subtle accent backdrop blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
                {searchedId}
              </h2>
              {getStatusBadge(folded.status)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Computed Current State via Realtime Event Folding
            </p>
          </div>

          {/* Action to append event live */}
          <button
            onClick={() => setShowAppendModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 transition-all focus:outline-none"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Append Event to Stream</span>
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-slate-100 dark:border-slate-800/80">
          
          {/* Location */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-500" /> Current Location
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {folded.location || 'Unknown'}
            </p>
          </div>

          {/* Route */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-teal-500" /> Carrier & Route
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {folded.carrier || 'Oceanic Carrier'}
            </p>
          </div>

          {/* Event Stream Version */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-teal-500" /> Stream Events
            </span>
            <p className="text-sm font-semibold font-mono text-slate-800 dark:text-slate-200">
              {eventCount} {eventCount === 1 ? 'event' : 'events'} (v{eventCount})
            </p>
          </div>

          {/* Last Updated */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-teal-500" /> Last Updated
            </span>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
              {lastUpdated}
            </p>
          </div>

        </div>

        {/* Alerts & Cargo Detail Section */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Cargo:</span>
            <span className="truncate">{folded.cargoDescription || 'General Cargo'}</span>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Route:</span>
            <span>{folded.origin} → {folded.destination}</span>
          </div>

          {/* Alert Badge if temperature spikes recorded */}
          {folded.temperatureAlerts && folded.temperatureAlerts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
              <span className="font-semibold">
                {folded.temperatureAlerts.length} Temp Spike Alert{folded.temperatureAlerts.length > 1 ? 's' : ''} (Max {Math.max(...folded.temperatureAlerts.map(a => a.currentTemp))}°C)
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Append Event Modal */}
      {showAppendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  Append Event to Stream
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Aggregate ID: {searchedId} • Next Version: v{eventCount + 1}
                </p>
              </div>
              <button
                onClick={() => setShowAppendModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAppendSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Event Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['TEMPERATURE_SPIKE', 'LOADED_ON_SHIP', 'ARRIVED_AT_PORT', 'CUSTOMS_CLEARED'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeSelect(type)}
                      className={`p-2.5 text-xs font-mono font-medium rounded-xl border text-left transition-all ${
                        selectedEventType === type
                          ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Event Payload (JSON)
                </label>
                <textarea
                  rows={6}
                  value={payloadJson}
                  onChange={(e) => setPayloadJson(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-teal-300 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAppendModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAppending}
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-500/20"
                >
                  {isAppending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Append & Replay</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StateSummaryCard;
