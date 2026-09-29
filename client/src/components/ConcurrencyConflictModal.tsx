import React from 'react';
import { AlertTriangle, RefreshCw, X, ShieldAlert, GitCommit, Database, Lock } from 'lucide-react';
import { ConcurrencyConflictInfo } from '../types';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

interface ConcurrencyConflictModalProps {
  conflict: ConcurrencyConflictInfo | null;
  onRefresh: () => void;
  onClose: () => void;
}

export const ConcurrencyConflictModal: React.FC<ConcurrencyConflictModalProps> = ({
  conflict,
  onRefresh,
  onClose,
}) => {
  if (!conflict || !conflict.isConflict) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1F1F1F] border border-[#DDDCD6] dark:border-[#333333] rounded-lg w-full max-w-lg overflow-hidden shadow-elev-3 animate-scaleIn font-sans">
        {/* Conflict Header */}
        <div className="bg-[#C94A4A]/10 dark:bg-[#C94A4A]/15 px-6 py-4 border-b border-[#C94A4A]/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C94A4A]/20 flex items-center justify-center text-[#C94A4A]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#C94A4A] text-base font-sans">
                  Concurrency Conflict
                </h3>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#C94A4A] text-white tracking-wider">
                  HTTP 409
                </span>
              </div>
              <p className="text-xs text-[#252525] dark:text-[#F5F5F0] font-sans mt-0.5 font-medium">
                This shipment was modified by another operation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded text-[#6B6B66] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Body */}
        <div className="p-6 space-y-5 text-xs font-sans">
          {/* Version Collision Matrix */}
          <div className="bg-[#FAF9F5] dark:bg-[#141414] p-4 rounded-md border border-[#DDDCD6] dark:border-[#333333] space-y-3 font-mono">
            <div className="text-[11px] font-bold text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider flex items-center justify-between">
              <span>Stream Version Mismatch</span>
              <span className="text-[#E56B2F] dark:text-[#E5A93C]">#{conflict.aggregateId}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded bg-white dark:bg-[#1C1C1F] border border-[#DDDCD6] dark:border-[#2D2D30] text-center space-y-1">
                <span className="text-[10px] text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wide block">
                  Your Submitted Version
                </span>
                <span className="text-2xl font-bold font-mono text-[#6B6B66] dark:text-[#9E9E98] line-through block">
                  v{conflict.expectedVersion ?? 'Stale'}
                </span>
                <span className="text-[10px] text-[#C94A4A] font-sans block">Stale Snapshot</span>
              </div>

              <div className="p-3 rounded bg-[#3F8F6B]/10 border border-[#3F8F6B]/30 text-center space-y-1">
                <span className="text-[10px] text-[#3F8F6B] uppercase tracking-wide block font-bold">
                  Current Database Version
                </span>
                <span className="text-2xl font-bold font-mono text-[#3F8F6B] block">
                  v{conflict.currentVersion ?? 'Head'}
                </span>
                <span className="text-[10px] text-[#3F8F6B] font-sans block font-semibold">Latest Committed</span>
              </div>
            </div>
          </div>

          {/* Audit Ledger Immutability Assurance */}
          <div className="p-3.5 rounded-md bg-[#FAF9F5] dark:bg-[#141414] border border-[#DDDCD6] dark:border-[#333333] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#252525] dark:text-[#F5F5F0] text-xs">
              <ShieldAlert className="w-4 h-4 text-[#D9A441] dark:text-[#E5A93C]" />
              <span>Event Store Immutability Protected</span>
            </div>
            <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] leading-relaxed">
              Your command was <strong className="text-[#C94A4A]">NOT written</strong> to the Event Store to prevent overwriting another user's event or corrupting ledger order.
            </p>
          </div>

          <p className="text-xs text-[#6B6B66] dark:text-[#9E9E98] leading-normal font-sans">
            Refresh the shipment to synchronize your client with the latest committed version (<span className="font-mono font-bold text-[#252525] dark:text-[#F5F5F0]">v{conflict.currentVersion}</span>) before re-dispatching your command.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#DDDCD6] dark:border-[#333333]">
            <SecondaryButton onClick={onClose}>
              Dismiss
            </SecondaryButton>
            <PrimaryButton
              icon={RefreshCw}
              onClick={onRefresh}
            >
              Refresh Shipment
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};
