import React, { useState } from 'react';
import { X, PackagePlus, AlertTriangle } from 'lucide-react';
import { useShipmentStore } from '../store/useShipmentStore';
import { useNavigate } from 'react-router-dom';

interface NewShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewShipmentModal: React.FC<NewShipmentModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { createShipment, isLoading } = useShipmentStore();

  const [aggregateId, setAggregateId] = useState(`AT-${Math.floor(2054 + Math.random() * 100)}`);
  const [origin, setOrigin] = useState('Port of Shanghai, CN');
  const [destination, setDestination] = useState('Port of Hamburg, DE');
  const [carrier, setCarrier] = useState('Maersk Line');
  const [vessel, setVessel] = useState('MV TransOcean Horizon');
  const [operator, setOperator] = useState('Logistics Dispatch Agent');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!aggregateId.trim()) {
      setErrorMsg('Aggregate ID is required');
      return;
    }

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
      onClose();
      navigate(`/shipments/${cleanId}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to dispatch CREATE_SHIPMENT command');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#DDDCD6] rounded-md w-full max-w-lg overflow-hidden shadow-xl animate-fadeIn">
        {/* Header */}
        <div className="bg-[#FAF9F5] px-6 py-4 border-b border-[#DDDCD6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-[#E56B2F]" />
            <h3 className="font-bold text-[#252525] text-base">Create New Shipment Aggregate</h3>
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
            <div className="bg-[#C94A4A]/10 border border-[#C94A4A]/30 text-[#C94A4A] text-xs p-3 rounded-md flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 text-[#C94A4A] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-mono text-[#6B6B66] mb-1">
              Shipment Aggregate ID <span className="text-[#C94A4A]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. AT-2055"
              value={aggregateId}
              onChange={(e) => setAggregateId(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#DDDCD6] rounded-md px-3 py-2 text-sm text-[#E56B2F] font-mono font-bold focus:border-[#E56B2F] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6B6B66] mb-1 font-mono">Port of Origin</label>
              <input
                type="text"
                placeholder="Port of Shanghai, CN"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DDDCD6] rounded-md px-3 py-2 text-sm text-[#252525] focus:border-[#E56B2F] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#6B6B66] mb-1 font-mono">Port of Destination</label>
              <input
                type="text"
                placeholder="Port of Rotterdam, NL"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DDDCD6] rounded-md px-3 py-2 text-sm text-[#252525] focus:border-[#E56B2F] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6B6B66] mb-1 font-mono">Ocean Carrier</label>
              <input
                type="text"
                placeholder="Maersk Line"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DDDCD6] rounded-md px-3 py-2 text-sm text-[#252525] focus:border-[#E56B2F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#6B6B66] mb-1 font-mono">Assigned Vessel</label>
              <input
                type="text"
                placeholder="MV Triple-E"
                value={vessel}
                onChange={(e) => setVessel(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DDDCD6] rounded-md px-3 py-2 text-sm text-[#252525] focus:border-[#E56B2F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#6B6B66] mb-1 font-mono">Dispatching Operator</label>
            <input
              type="text"
              placeholder="Logistics Dispatch Officer"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#DDDCD6] rounded-md px-3 py-2 text-sm text-[#252525] focus:border-[#E56B2F] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#DDDCD6]">
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
                <span>Executing Command...</span>
              ) : (
                <>
                  <PackagePlus className="w-4 h-4" />
                  <span>Dispatch CREATE_SHIPMENT</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
