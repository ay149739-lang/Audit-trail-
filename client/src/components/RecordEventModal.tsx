import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  ThermometerSnowflake,
  MapPin,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  GitBranch,
  Lock,
} from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

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
  const {
    moveShipment,
    recordEvent,
    liveShipment,
    selectedShipment,
    refreshShipment,
    isLoading,
  } = useShipmentStore();

  const currentVersion = liveShipment?.latestVersion || selectedShipment?.latestVersion || 1;

  const [mode, setMode] = useState<'MOVE' | 'CUSTOM'>('MOVE');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('TEMPERATURE_SPIKE');
  const [temperature, setTemperature] = useState<string>('-11.5');
  const [notes, setNotes] = useState('');
  const [operator, setOperator] = useState('Port Control Officer');
  const [expectedVersionInput, setExpectedVersionInput] = useState<string>(String(currentVersion));
  const [showAdvancedOcc, setShowAdvancedOcc] = useState(false);

  // OCC Conflict State
  const [conflictState, setConflictState] = useState<{
    isConflict: boolean;
    message: string;
    expectedVersion?: number;
    currentVersion?: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Keep expectedVersionInput in sync when modal opens or shipment version changes
  useEffect(() => {
    if (isOpen) {
      setExpectedVersionInput(String(currentVersion));
      setConflictState(null);
      setErrorMsg('');
    }
  }, [isOpen, currentVersion]);

  if (!isOpen) return null;

  const handleRefreshAndSync = async () => {
    try {
      await refreshShipment(aggregateId);
      const freshVersion = (liveShipment?.latestVersion || selectedShipment?.latestVersion || currentVersion) + 1;
      setExpectedVersionInput(String(freshVersion));
      setConflictState(null);
      setErrorMsg('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setConflictState(null);

    const parsedExpectedVersion = expectedVersionInput.trim() !== ''
      ? parseInt(expectedVersionInput, 10)
      : currentVersion;

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
          expectedVersion: parsedExpectedVersion,
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
          expectedVersion: parsedExpectedVersion,
        });
      }

      onClose();
    } catch (err: any) {
      if (err.response?.status === 409 || err.response?.data?.code === 'CONCURRENCY_CONFLICT') {
        const conflict = {
          isConflict: true,
          message:
            err.response?.data?.error ||
            'Shipment has been modified by another operation. Refresh the shipment and try again.',
          expectedVersion: err.response?.data?.expectedVersion ?? parsedExpectedVersion,
          currentVersion: err.response?.data?.currentVersion ?? (currentVersion + 1),
        };
        setConflictState(conflict);
      } else {
        setErrorMsg(err.response?.data?.error || 'Failed to dispatch command to Event Store');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1F1F1F] border border-[#DDDCD6] dark:border-[#333333] rounded-md w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn font-sans">
        {/* Modal Header */}
        <div className="bg-[#FAF9F5] dark:bg-[#141414] px-6 py-4 border-b border-[#DDDCD6] dark:border-[#333333] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#E56B2F] dark:text-[#E5A93C]" />
              <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-base">Dispatch CQRS Command</h3>
            </div>
            <p className="text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono mt-0.5">
              Append Immutable Event to <span className="text-[#E56B2F] dark:text-[#E5A93C] font-bold">{aggregateId}</span> (Head v{currentVersion})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B6B66] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans text-xs">
          {/* OCC CONFLICT NOTIFICATION BANNER */}
          {conflictState && (
            <div className="bg-[#C94A4A]/10 border border-[#C94A4A]/30 p-4 rounded-md space-y-3 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#C94A4A] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-[#C94A4A]">Concurrency Conflict (HTTP 409)</h4>
                    <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#C94A4A] text-white font-bold">
                      OCC COLLISION
                    </span>
                  </div>
                  <p className="text-[11px] text-[#252525] dark:text-[#F5F5F0] font-medium leading-relaxed">
                    This shipment was modified by another operation.
                  </p>
                </div>
              </div>

              {/* Version Comparison Box */}
              <div className="grid grid-cols-2 gap-2 text-center font-mono text-[11px] bg-white dark:bg-[#141414] p-2.5 rounded border border-[#C94A4A]/20">
                <div>
                  <span className="text-[#888888] block text-[10px]">Your Version</span>
                  <span className="font-bold text-[#888888] line-through">v{conflictState.expectedVersion}</span>
                  <span className="text-[9px] text-[#C94A4A] block">Stale</span>
                </div>
                <div>
                  <span className="text-[#3F8F6B] block text-[10px] font-bold">Current Version</span>
                  <span className="font-bold text-[#3F8F6B]">v{conflictState.currentVersion}</span>
                  <span className="text-[9px] text-[#3F8F6B] block">Head</span>
                </div>
              </div>

              <div className="text-[10px] text-[#6B6B66] dark:text-[#9E9E98] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#D9A441] dark:text-[#E5A93C] shrink-0" />
                <span>Your command was not written to the Event Store.</span>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleRefreshAndSync}
                  className="px-3 py-1.5 rounded bg-[#252525] dark:bg-[#E5A93C] text-white dark:text-[#141414] font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Shipment (Load v{conflictState.currentVersion})</span>
                </button>
              </div>
            </div>
          )}

          {errorMsg && !conflictState && (
            <div className="bg-[#C94A4A]/10 border border-[#C94A4A]/30 text-[#C94A4A] text-xs p-3 rounded-md flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C94A4A] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex bg-[#FAF9F5] dark:bg-[#141414] p-1 rounded-md border border-[#DDDCD6] dark:border-[#333333] text-xs font-mono">
            <button
              type="button"
              onClick={() => setMode('MOVE')}
              className={`flex-1 py-2 rounded-md transition-all ${mode === 'MOVE'
                  ? 'bg-white dark:bg-[#262626] text-[#E56B2F] dark:text-[#E5A93C] border border-[#DDDCD6] dark:border-[#333333] font-bold shadow-sm'
                  : 'text-[#6B6B66] dark:text-[#9E9E98]'
                }`}
            >
              MOVE_SHIPMENT Command
            </button>
            <button
              type="button"
              onClick={() => setMode('CUSTOM')}
              className={`flex-1 py-2 rounded-md transition-all ${mode === 'CUSTOM'
                  ? 'bg-white dark:bg-[#262626] text-[#D9A441] dark:text-[#E5A93C] border border-[#DDDCD6] dark:border-[#333333] font-bold shadow-sm'
                  : 'text-[#6B6B66] dark:text-[#9E9E98]'
                }`}
            >
              RECORD_EVENT Command
            </button>
          </div>

          {mode === 'MOVE' ? (
            <div>
              <label className="block text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] mb-1">
                Target Location / Terminal <span className="text-[#C94A4A]">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-[#6B6B66] dark:text-[#9E9E98]" />
                <input
                  type="text"
                  placeholder="e.g. Port of Antwerp, Berth 12"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md pl-9 pr-3 py-2 text-sm text-[#252525] dark:text-[#F5F5F0] focus:border-[#E56B2F] dark:focus:border-[#E5A93C] focus:outline-none font-mono"
                  required
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] mb-1">
                  Domain Event Type <span className="text-[#C94A4A]">*</span>
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md px-3 py-2 text-sm text-[#252525] dark:text-[#F5F5F0] focus:border-[#E56B2F] dark:focus:border-[#E5A93C] focus:outline-none font-mono"
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
                  <label className="block text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] mb-1">
                    Recorded Sensor Temperature (°C)
                  </label>
                  <div className="relative">
                    <ThermometerSnowflake className="absolute left-3 top-2.5 w-4 h-4 text-[#C94A4A]" />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="-11.4"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md pl-9 pr-3 py-2 text-sm text-[#252525] dark:text-[#F5F5F0] focus:border-[#C94A4A] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] mb-1">Operator Signature</label>
            <input
              type="text"
              placeholder="e.g. Captain Aris Thorne"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md px-3 py-2 text-sm text-[#252525] dark:text-[#F5F5F0] focus:border-[#E56B2F] dark:focus:border-[#E5A93C] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] mb-1">Audit Log Notes</label>
            <textarea
              rows={2}
              placeholder="Add contextual details for this immutable event entry..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md px-3 py-2 text-sm text-[#252525] dark:text-[#F5F5F0] focus:border-[#E56B2F] dark:focus:border-[#E5A93C] focus:outline-none"
            />
          </div>

          {/* OCC Expected Version Toggle for Concurrency Testing */}
          <div className="pt-1 border-t border-[#DDDCD6]/60 dark:border-[#333333]/60">
            <button
              type="button"
              onClick={() => setShowAdvancedOcc(!showAdvancedOcc)}
              className="text-[11px] font-mono text-[#6B6B66] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0] flex items-center gap-1.5 focus:outline-none"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#E56B2F] dark:text-[#E5A93C]" />
              <span>{showAdvancedOcc ? 'Hide OCC Parameters' : 'Optimistic Concurrency Control (OCC) Settings'}</span>
              <span className="text-[10px] text-[#E56B2F] dark:text-[#E5A93C] font-bold">
                (Target: v{expectedVersionInput})
              </span>
            </button>

            {showAdvancedOcc && (
              <div className="mt-2.5 p-3 rounded bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-[#6B6B66] dark:text-[#9E9E98]">
                    Expected Version (OCC Guard):
                  </label>
                  <span className="text-[10px] font-mono text-[#3F8F6B] font-bold">
                    Head: v{currentVersion}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={expectedVersionInput}
                    onChange={(e) => setExpectedVersionInput(e.target.value)}
                    className="w-24 bg-white dark:bg-[#1F1F1F] border border-[#DDDCD6] dark:border-[#333333] rounded px-2.5 py-1 text-xs font-mono text-[#252525] dark:text-[#F5F5F0] focus:outline-none focus:border-[#E56B2F]"
                  />
                  <button
                    type="button"
                    onClick={() => setExpectedVersionInput(String(Math.max(1, currentVersion - 1)))}
                    className="px-2 py-1 rounded bg-[#C94A4A]/10 text-[#C94A4A] border border-[#C94A4A]/30 text-[10px] font-mono hover:bg-[#C94A4A]/20 transition-colors"
                  >
                    Simulate Stale Version (v{Math.max(1, currentVersion - 1)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpectedVersionInput(String(currentVersion))}
                    className="px-2 py-1 rounded bg-[#3F8F6B]/10 text-[#3F8F6B] border border-[#3F8F6B]/30 text-[10px] font-mono hover:bg-[#3F8F6B]/20 transition-colors"
                  >
                    Reset to Head
                  </button>
                </div>
                <p className="text-[10px] text-[#888888] font-sans">
                  The backend validates that <code className="font-mono">expectedVersion === currentVersion</code>. Submitting a stale version triggers HTTP 409 Conflict.
                </p>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#DDDCD6] dark:border-[#333333]">
            <SecondaryButton onClick={onClose}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isLoading}
              icon={Send}
            >
              {isLoading ? 'Validating & Appending...' : 'Append Immutable Event'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};
