import React, { useState } from 'react';
import { X, Send, ThermometerSnowflake, MapPin, Tag, AlertTriangle } from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';

interface RecordEventModalProps {
  aggregateId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const RecordEventModal: React.FC<RecordEventModalProps> = ({
  aggregateId,
  isOpen,
  onClose,
}) => {
  const { moveShipment, recordEvent, isLoading } = useShipmentStore();

  const [mode, setMode] = useState<'MOVE' | 'CUSTOM'>('MOVE');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('TEMPERATURE_SPIKE');
  const [temperature, setTemperature] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [operator, setOperator] = useState('Port Control Operator');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (mode === 'MOVE') {
        if (!location.trim()) {
          setErrorMsg('Target location is required');
          return;
        }
        await moveShipment(aggregateId, {
          location: location.trim(),
          operator: operator.trim() || 'Logistics Controller',
          notes: notes.trim() || undefined,
        });
      } else {
        if (!eventType.trim()) {
          setErrorMsg('Event type is required');
          return;
        }

        const payload: any = {
          notes: notes.trim() || undefined,
          operator: operator.trim() || 'Logistics Inspector',
        };

        if (temperature !== '') {
          payload.temperature = parseFloat(temperature);
        }

        if (location.trim()) {
          payload.location = location.trim();
        }

        await recordEvent(aggregateId, {
          eventType: eventType.trim(),
          payload,
          operator: operator.trim(),
        });
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to dispatch command to Event Store');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-slate-100 text-base">Dispatch CQRS Command</h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Append Immutable Event to <span className="text-teal-400 font-bold">{aggregateId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setMode('MOVE')}
              className={`flex-1 py-2 rounded-md transition-all ${
                mode === 'MOVE' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MOVE_SHIPMENT Command
            </button>
            <button
              type="button"
              onClick={() => setMode('CUSTOM')}
              className={`flex-1 py-2 rounded-md transition-all ${
                mode === 'CUSTOM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              RECORD_EVENT Command
            </button>
          </div>

          {mode === 'MOVE' ? (
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Target Location / Terminal <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Port of Antwerp, Berth 12"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Domain Event Type <span className="text-rose-400">*</span>
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none font-mono"
                >
                  <option value="TEMPERATURE_SPIKE">TEMPERATURE_SPIKE</option>
                  <option value="ARRIVED_AT_PORT">ARRIVED_AT_PORT</option>
                  <option value="CUSTOMS_CLEARED">CUSTOMS_CLEARED</option>
                  <option value="INSPECTION_PASSED">INSPECTION_PASSED</option>
                  <option value="DELIVERED">DELIVERED</option>
                </select>
              </div>

              {eventType === 'TEMPERATURE_SPIKE' && (
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Recorded Temperature (°C)
                  </label>
                  <div className="relative">
                    <ThermometerSnowflake className="absolute left-3 top-2.5 w-4 h-4 text-amber-400" />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="-12.5"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Operator Signature</label>
            <input
              type="text"
              placeholder="e.g. Captain Aris Thorne"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Audit Log Notes</label>
            <textarea
              rows={2}
              placeholder="Add contextual details for this immutable event entry..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-md shadow-teal-900/30 font-mono flex items-center gap-1.5"
            >
              {isLoading ? (
                <span>Appending Event...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Append Immutable Event</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
