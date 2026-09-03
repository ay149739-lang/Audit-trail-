import React, { useState } from 'react';
import { X, Send, ThermometerSnowflake, MapPin, AlertTriangle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#DDDCD6] rounded-md w-full max-w-lg overflow-hidden shadow-xl animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-[#FAF9F5] px-6 py-4 border-b border-[#DDDCD6] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#E56B2F]" />
              <h3 className="font-bold text-[#252525] text-base">Dispatch CQRS Command</h3>
            </div>
            <p className="text-xs text-[#6B6B66] font-mono mt-0.5">
              Append Immutable Event to <span className="text-[#E56B2F] font-bold">{aggregateId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B6B66] hover:text-[#252525] hover:bg-[#DDDCD6]/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans text-xs">
          {errorMsg && (
            <div className="bg-[#C94A4A]/10 border border-[#C94A4A]/30 text-[#C94A4A] text-xs p-3 rounded-md flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C94A4A] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex bg-[#FAF9F5] p-1 rounded-md border border-[#DDDCD6] text-xs font-mono">
            <button
              type="button"
              onClick={() => setMode('MOVE')}
              className={`flex-1 py-2 rounded-md transition-all ${
                mode === 'MOVE' ? 'bg-white text-[#E56B2F] border border-[#DDDCD6] font-bold shadow-xs' : 'text-[#6B6B66] hover:text-[#252525]'
              }`}
            >
              MOVE_SHIPMENT Command
            </button>
            <button
              type="button"
              onClick={() => setMode('CUSTOM')}
              className={`flex-1 py-2 rounded-md transition-all ${
                mode === 'CUSTOM' ? 'bg-white text-[#D9A441] border border-[#DDDCD6] font-bold shadow-xs' : 'text-[#6B6B66] hover:text-[#252525]'
              }`}
            >
              RECORD_EVENT Command
            </button>
          </div>

          {mode === 'MOVE' ? (
            <div>
              <label className="block text-xs font-mono text-[#6B6B66] mb-1">
                Target Location / Terminal <span className="text-[#C94A4A]">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-[#6B6B66]" />
                <input
                  type="text"
                  placeholder="e.g. Port of Antwerp, Berth 12"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDDCD6] rounded-md pl-9 pr-3 py-2 text-sm text-[#252525] focus:border-[#E56B2F] focus:outline-none"
                  required
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-mono text-[#6B6B66] mb-1">
                  Domain Event Type <span className="text-[#C94A4A]">*</span>
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDDCD6] rounded-md px-3 py-2 text-sm text-[#252525] focus:border-[#E56B2F] focus:outline-none font-mono"
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
                  <label className="block text-xs font-mono text-[#6B6B66] mb-1">
                    Recorded Temperature (°C)
                  </label>
                  <div className="relative">
                    <ThermometerSnowflake className="absolute left-3 top-2.5 w-4 h-4 text-[#C94A4A]" />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="-12.5"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#DDDCD6] rounded-md pl-9 pr-3 py-2 text-sm text-[#252525] focus:border-[#C94A4A] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-mono text-[#6B6B66] mb-1">Operator Signature</label>
            <input
              type="text"
              placeholder="e.g. Captain Aris Thorne"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#DDDCD6] rounded-md px-3 py-2 text-sm text-[#252525] focus:border-[#E56B2F] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#6B6B66] mb-1">Audit Log Notes</label>
            <textarea
              rows={2}
              placeholder="Add contextual details for this immutable event entry..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#DDDCD6] rounded-md px-3 py-2 text-sm text-[#252525] focus:border-[#E56B2F] focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#DDDCD6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-xs text-[#6B6B66] hover:bg-[#FAF9F5] font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#E56B2F] hover:bg-[#D45A1E] text-white px-4 py-2 rounded-md text-xs font-semibold transition-all shadow-xs font-sans flex items-center gap-1.5"
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
