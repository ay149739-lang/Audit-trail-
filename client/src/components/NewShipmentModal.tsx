import React, { useState } from 'react';
import { X, PackagePlus, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';
import { useNavigate } from 'react-router-dom';

interface NewShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatchSuccess?: (aggregateId: string) => void;
}

export const NewShipmentModal: React.FC<NewShipmentModalProps> = ({
  isOpen,
  onClose,
  onDispatchSuccess,
}) => {
  const navigate = useNavigate();
  const { createShipment, isLoading } = useShipmentStore();

  const [aggregateId, setAggregateId] = useState(`AT-${Math.floor(2054 + Math.random() * 100)}`);
  const [origin, setOrigin] = useState('Port of Shanghai, CN');
  const [destination, setDestination] = useState('Port of Hamburg, DE');
  const [carrier, setCarrier] = useState('Maersk Line');
  const [vessel, setVessel] = useState('MV TransOcean Horizon');
  const [operator, setOperator] = useState('Logistics Dispatch Agent');
  const [errorMsg, setErrorMsg] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!aggregateId.trim()) {
      setErrorMsg('Aggregate ID is required');
      return;
    }

    // Advance to lightweight confirmation step
    setIsConfirming(true);
  };

  const handleConfirmedDispatch = async () => {
    setErrorMsg('');

    try {
      const cleanId = aggregateId.trim().toUpperCase();
      await createShipment({
        aggregateId: cleanId,
        origin: origin.trim(),
        destination: destination.trim(),
        carrier: carrier.trim(),
        vessel: vessel.trim(),
        operator: operator.trim(),
      });

      setIsConfirming(false);
      onClose();

      if (onDispatchSuccess) {
        onDispatchSuccess(cleanId);
      }

      navigate(`/shipments/${cleanId}`);
    } catch (err: any) {
      setIsConfirming(false);
      setErrorMsg(err.response?.data?.error || 'Failed to dispatch CREATE_SHIPMENT command');
    }
  };

  const handleClose = () => {
    setIsConfirming(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1F1F1F] border border-[#DDDCD6] dark:border-[#333333] rounded-md w-full max-w-lg overflow-hidden shadow-xl animate-fadeIn font-sans">
        {/* Header */}
        <div className="bg-[#FAF9F5] dark:bg-[#141414] px-6 py-4 border-b border-[#DDDCD6] dark:border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-[#E56B2F] dark:text-[#E5A93C]" />
            <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm font-sans">
              {isConfirming ? 'Confirm Container Dispatch' : 'Create New Shipment Aggregate'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="p-1 rounded text-[#6B6B66] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0] focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 bg-[#C94A4A]/10 border border-[#C94A4A]/30 text-[#C94A4A] text-xs p-3 rounded-md flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-[#C94A4A] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isConfirming ? (
          /* Confirmation Step */
          <div className="p-6 space-y-4 font-sans text-xs">
            <div className="bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md p-4 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-2">
                <span className="text-[#6B6B66] dark:text-[#9E9E98]">Target Aggregate:</span>
                <span className="font-bold text-[#E56B2F] dark:text-[#E5A93C] text-sm">
                  #{aggregateId.trim().toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#6B6B66] dark:text-[#9E9E98]">Route:</span>
                <span className="text-[#252525] dark:text-[#F5F5F0]">{origin} → {destination}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#6B6B66] dark:text-[#9E9E98]">Carrier / Vessel:</span>
                <span className="text-[#252525] dark:text-[#F5F5F0]">{carrier} • {vessel}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#6B6B66] dark:text-[#9E9E98]">Event Appended:</span>
                <span className="text-[#3F8F6B] dark:text-[#3A8B88] font-bold">CONTAINER_CREATED (v1)</span>
              </div>
            </div>

            <div className="text-[#6B6B66] dark:text-[#9E9E98] text-xs leading-relaxed font-mono">
              Dispatch new container? This will create a new immutable event stream in the append-only ledger.
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#DDDCD6] dark:border-[#333333]">
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="px-3.5 py-2 rounded-md text-xs font-bold text-[#6B6B66] dark:text-[#9E9E98] hover:bg-[#FAF9F5] dark:hover:bg-[#262626] font-mono transition-colors"
              >
                Back / Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmedDispatch}
                disabled={isLoading}
                className="bg-[#E56B2F] hover:bg-[#D45A1E] dark:bg-[#E5A93C] dark:hover:bg-[#D49A2A] text-white dark:text-[#141414] px-3.5 py-2 rounded-md text-xs font-bold transition-all shadow-sm font-mono inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
              >
                {isLoading ? (
                  <span>Appending Event...</span>
                ) : (
                  <>
                    <PackagePlus className="w-3.5 h-3.5" />
                    <span>Dispatch Container</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Form Step */
          <form onSubmit={handleInitialSubmit} className="p-6 space-y-4 font-sans text-xs">
            <div>
              <label className="block font-mono text-[#6B6B66] dark:text-[#9E9E98] mb-1">
                Shipment Aggregate ID <span className="text-[#C94A4A]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. AT-2055"
                value={aggregateId}
                onChange={(e) => setAggregateId(e.target.value)}
                className="w-full bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md px-3 py-2 text-sm text-[#E56B2F] dark:text-[#E5A93C] font-mono font-bold focus:border-[#E56B2F] dark:focus:border-[#E5A93C] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#6B6B66] dark:text-[#9E9E98] mb-1 font-mono">Port of Origin</label>
                <input
                  type="text"
                  placeholder="Port of Shanghai, CN"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md px-3 py-2 text-xs text-[#252525] dark:text-[#F5F5F0] focus:border-[#E56B2F] dark:focus:border-[#E5A93C] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[#6B6B66] dark:text-[#9E9E98] mb-1 font-mono">Port of Destination</label>
                <input
                  type="text"
                  placeholder="Port of Rotterdam, NL"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md px-3 py-2 text-xs text-[#252525] dark:text-[#F5F5F0] focus:border-[#E56B2F] dark:focus:border-[#E5A93C] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#6B6B66] dark:text-[#9E9E98] mb-1 font-mono">Ocean Carrier</label>
                <input
                  type="text"
                  placeholder="Maersk Line"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md px-3 py-2 text-xs text-[#252525] dark:text-[#F5F5F0] focus:border-[#E56B2F] dark:focus:border-[#E5A93C] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#6B6B66] dark:text-[#9E9E98] mb-1 font-mono">Assigned Vessel</label>
                <input
                  type="text"
                  placeholder="MV Triple-E"
                  value={vessel}
                  onChange={(e) => setVessel(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md px-3 py-2 text-xs text-[#252525] dark:text-[#F5F5F0] focus:border-[#E56B2F] dark:focus:border-[#E5A93C] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#6B6B66] dark:text-[#9E9E98] mb-1 font-mono">Dispatching Operator</label>
              <input
                type="text"
                placeholder="Logistics Dispatch Officer"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] rounded-md px-3 py-2 text-xs text-[#252525] dark:text-[#F5F5F0] focus:border-[#E56B2F] dark:focus:border-[#E5A93C] focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#DDDCD6] dark:border-[#333333]">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-2 rounded-md text-xs font-bold text-[#6B6B66] dark:text-[#9E9E98] hover:bg-[#FAF9F5] dark:hover:bg-[#262626] font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#E56B2F] hover:bg-[#D45A1E] dark:bg-[#E5A93C] dark:hover:bg-[#D49A2A] text-white dark:text-[#141414] px-3.5 py-2 rounded-md text-xs font-bold transition-all shadow-sm font-mono inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
              >
                <span>Continue to Confirmation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
