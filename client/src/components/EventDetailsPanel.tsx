import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  MapPin,
  Clock,
  ThermometerSnowflake,
  History,
  Lock,
  User,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Server,
  Activity,
  Layers,
} from 'lucide-react';
import { IEvent } from '../types';

interface EventDetailsPanelProps {
  event: IEvent | null;
  maxVersion: number;
  currentCutoffVersion?: number;
  isHistorical: boolean;
  onRewindToEvent?: (version: number) => void;
}

export const EventDetailsPanel: React.FC<EventDetailsPanelProps> = ({
  event,
  maxVersion,
  currentCutoffVersion,
  isHistorical,
  onRewindToEvent,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'AUDIT' | 'RAW'>('AUDIT');

  if (!event) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#1F1F1F] rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm font-sans space-y-2">
        <Layers className="w-8 h-8 text-[#888888] mx-auto opacity-50" />
        <p className="font-bold text-xs text-[#252525] dark:text-[#F5F5F0]">No Event Selected</p>
        <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98]">
          Click any entry in the event ledger or on the sensor chart to inspect forensic audit details.
        </p>
      </div>
    );
  }

  const payload = event.payload || {};
  const isSpike = event.eventType === 'TEMPERATURE_SPIKE';
  const eventId = event._id || `EVT-${event.aggregateId}-V${event.version}`;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-4 font-sans sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 flex items-center justify-center text-[#E56B2F] dark:text-[#E5A93C]">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm">
              Event Details &amp; Forensics
            </h3>
            <span className="font-mono text-[10px] text-[#6B6B66] dark:text-[#9E9E98]">
              {eventId}
            </span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-[#FAF9F5] dark:bg-[#141414] p-0.5 rounded border border-[#DDDCD6] dark:border-[#333333] text-[10px] font-mono">
          <button
            onClick={() => setViewMode('AUDIT')}
            className={`px-2 py-1 rounded transition-colors ${viewMode === 'AUDIT'
              ? 'bg-white dark:bg-[#262626] text-[#E56B2F] dark:text-[#E5A93C] font-bold shadow-xs'
              : 'text-[#6B6B66] dark:text-[#9E9E98]'
              }`}
          >
            Audit Log
          </button>
          <button
            onClick={() => setViewMode('RAW')}
            className={`px-2 py-1 rounded transition-colors ${viewMode === 'RAW'
              ? 'bg-white dark:bg-[#262626] text-[#E56B2F] dark:text-[#E5A93C] font-bold shadow-xs'
              : 'text-[#6B6B66] dark:text-[#9E9E98]'
              }`}
          >
            JSON
          </button>
        </div>
      </div>

      {/* Primary Key-Value Summary Card */}
      <div className="bg-[#FAF9F5] dark:bg-[#141414] p-3.5 rounded-md border border-[#DDDCD6] dark:border-[#333333] space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span
            className={`font-bold tracking-tight text-sm font-sans ${isSpike ? 'text-[#C94A4A]' : 'text-[#252525] dark:text-[#F5F5F0]'
              }`}
          >
            {event.eventType}
          </span>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#FAF9F5] dark:bg-[#1F1F1F] text-[#E56B2F] dark:text-[#E5A93C] border border-[#DDDCD6] dark:border-[#333333]">
            v{event.version} of {maxVersion}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#DDDCD6]/60 dark:border-[#333333]/60 text-[11px] font-mono">
          <div>
            <span className="text-[#888888] block text-[10px]">Shipment ID</span>
            <span className="font-bold text-[#252525] dark:text-[#F5F5F0]">
              #{event.aggregateId}
            </span>
          </div>
          <div>
            <span className="text-[#888888] block text-[10px]">Actor / Authority</span>
            <span className="text-[#252525] dark:text-[#F5F5F0] truncate block font-sans">
              {payload.operator || 'System Dispatch'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-[#888888] font-mono pt-1">
          <Clock className="w-3 h-3 text-[#888888]" />
          <span>Timestamp: {new Date(event.timestamp).toUTCString()}</span>
        </div>
      </div>

      {viewMode === 'AUDIT' ? (
        <div className="space-y-3 text-xs">
          {/* Sensor Telemetry Section if available */}
          {(payload.temperature !== undefined || payload.targetTemp !== undefined || isSpike) && (
            <div className="p-3 bg-[#FAF9F5] dark:bg-[#141414] rounded-md border border-[#DDDCD6] dark:border-[#333333] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-[#252525] dark:text-[#F5F5F0]">
                  <ThermometerSnowflake className="w-3.5 h-3.5 text-[#E56B2F] dark:text-[#E5A93C]" />
                  <span>Cold Chain Telemetry</span>
                </span>
                {isSpike && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#C94A4A]/10 text-[#C94A4A] border border-[#C94A4A]/30 font-bold">
                    ANOMALY
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div>
                  <span className="text-[#888888] block text-[10px]">Recorded Temp:</span>
                  <span
                    className={`font-bold text-sm ${isSpike ? 'text-[#C94A4A]' : 'text-[#3F8F6B]'
                      }`}
                  >
                    {payload.temperature !== undefined ? `${payload.temperature}°C` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px]">Threshold / Target:</span>
                  <span className="text-[#252525] dark:text-[#F5F5F0] font-bold">
                    {payload.threshold !== undefined
                      ? `${payload.threshold}°C (Limit)`
                      : payload.targetTemp !== undefined
                        ? `${payload.targetTemp}°C (Target)`
                        : 'Standard'}
                  </span>
                </div>
              </div>

              {payload.sensorId && (
                <div className="text-[10px] text-[#888888] font-mono">
                  Sensor ID: <strong className="text-[#252525] dark:text-[#F5F5F0]">{payload.sensorId}</strong>
                </div>
              )}
            </div>
          )}

          {/* Formatted Audit Parameters */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wider block font-sans">
              Forensic Parameters
            </span>

            <div className="bg-white dark:bg-[#1A1A1D] rounded-md border border-[#DDDCD6] dark:border-[#333333] divide-y divide-[#DDDCD6]/60 dark:divide-[#333333]/60 text-[11px]">
              {(payload.location || payload.origin || payload.destination) && (
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#888888]">Location:</span>
                  <span className="font-semibold text-[#252525] dark:text-[#F5F5F0] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#E56B2F] dark:text-[#E5A93C]" />
                    {payload.location || payload.origin || payload.destination}
                  </span>
                </div>
              )}

              {payload.vessel && (
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#888888]">Vessel / Craft:</span>
                  <span className="font-medium text-[#252525] dark:text-[#F5F5F0]">
                    {payload.vessel}
                  </span>
                </div>
              )}

              {payload.carrier && (
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#888888]">Carrier:</span>
                  <span className="font-medium text-[#252525] dark:text-[#F5F5F0]">
                    {payload.carrier}
                  </span>
                </div>
              )}

              {payload.containerId && (
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#888888]">Container Ref:</span>
                  <span className="font-mono text-[#252525] dark:text-[#F5F5F0]">
                    {payload.containerId}
                  </span>
                </div>
              )}

              {payload.sealNumber && (
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#888888]">Security Seal:</span>
                  <span className="font-mono text-[#252525] dark:text-[#F5F5F0]">
                    {payload.sealNumber}
                  </span>
                </div>
              )}

              {payload.clearanceCode && (
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#888888]">Customs Code:</span>
                  <span className="font-mono font-bold text-[#3F8F6B]">
                    {payload.clearanceCode}
                  </span>
                </div>
              )}

              {payload.notes && (
                <div className="p-2.5 bg-[#FAF9F5] dark:bg-[#141414] text-[11px] text-[#4A4A45] dark:text-[#CCCCCC]">
                  <span className="font-bold block text-[10px] text-[#888888] uppercase mb-0.5">
                    Audit Log Annotation
                  </span>
                  <span>{payload.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Raw JSON Inspector Mode */
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#888888] uppercase tracking-wide font-mono text-[10px]">
              Cryptographic Event Object
            </span>
            <button
              onClick={handleCopyPayload}
              className="text-[#E56B2F] dark:text-[#E5A93C] hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              {isCopied ? <Check className="w-3 h-3 text-[#3F8F6B]" /> : <Copy className="w-3 h-3" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-3 bg-[#141414] text-[#F5F5F0] rounded-md border border-[#333333] font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
            <code>{JSON.stringify(event, null, 2)}</code>
          </pre>
        </div>
      )}

      {/* Rewind State Action Button */}
      {onRewindToEvent && (
        <div className="pt-2 border-t border-[#DDDCD6]/60 dark:border-[#333333]/60">
          {event.version !== (currentCutoffVersion || maxVersion) ? (
            <button
              onClick={() => onRewindToEvent(event.version)}
              className="w-full py-2 bg-[#FAF9F5] dark:bg-[#262626] border border-[#DDDCD6] dark:border-[#333333] hover:border-[#E56B2F] dark:hover:border-[#E5A93C] text-[#252525] dark:text-[#F5F5F0] rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C]"
            >
              <History className="w-3.5 h-3.5 text-[#E56B2F] dark:text-[#E5A93C]" />
              <span>
                Rewind Aggregate State to Event (v{event.version})
              </span>
            </button>
          ) : isHistorical ? (
            <div className="text-center p-2 text-[11px] font-mono text-[#D9A441] dark:text-[#E5A93C] bg-[#D9A441]/10 rounded border border-[#D9A441]/30">
              Inspecting Scrubber Cutoff Position (v{currentCutoffVersion})
            </div>
          ) : (
            <div className="text-center p-1.5 text-[10px] font-mono text-[#3F8F6B] bg-[#3F8F6B]/10 rounded border border-[#3F8F6B]/25">
              Inspecting Live Head Position (v{maxVersion})
            </div>
          )}
        </div>
      )}
    </div>
  );
};
