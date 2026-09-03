import React, { useState } from 'react';
import { X, PackagePlus, MapPin, Truck, Ship, AlertTriangle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-slate-100 text-base">Create New Shipment Aggregate</h3>
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

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Shipment Aggregate ID <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. AT-2055"
              value={aggregateId}
              onChange={(e) => setAggregateId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-teal-400 font-mono font-semibold focus:border-teal-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Port of Origin</label>
              <input
                type="text"
                placeholder="Port of Shanghai, CN"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Port of Destination</label>
              <input
                type="text"
                placeholder="Port of Rotterdam, NL"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Ocean Carrier</label>
              <input
                type="text"
                placeholder="Maersk Line"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Assigned Vessel</label>
              <input
                type="text"
                placeholder="MV Triple-E"
                value={vessel}
                onChange={(e) => setVessel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Dispatching Operator</label>
            <input
              type="text"
              placeholder="Logistics Dispatch Officer"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
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
