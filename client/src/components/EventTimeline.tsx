import React from 'react';
import {
  PackagePlus,
  Ship,
  Anchor,
  FileCheck2,
  CheckCircle2,
  Navigation,
  Clock,
  MapPin,
  Code2,
  AlertTriangle,
  ThermometerSnowflake,
} from 'lucide-react';
import { IEvent } from '../types';

interface EventTimelineProps {
  events: IEvent[];
  onSelectEvent: (event: IEvent) => void;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events, onSelectEvent }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-8 bg-[#010f1f] rounded border border-[#1c2b3c] text-center">
        <Clock className="w-8 h-8 text-[#8c909f] mx-auto mb-2" />
        <p className="text-xs text-[#8c909f] font-mono">No events recorded in append-only store for this aggregate.</p>
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'CONTAINER_CREATED':
        return <PackagePlus className="w-3.5 h-3.5 text-[#4d8eff]" />;
      case 'LOADED_ON_SHIP':
        return <Ship className="w-3.5 h-3.5 text-[#38bdf8]" />;
      case 'TEMPERATURE_SPIKE':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] animate-pulse" />;
      case 'ARRIVED_AT_PORT':
        return <Anchor className="w-3.5 h-3.5 text-[#818cf8]" />;
      case 'CUSTOMS_CLEARED':
        return <FileCheck2 className="w-3.5 h-3.5 text-[#c084fc]" />;
      case 'DELIVERED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />;
      default:
        return <Navigation className="w-3.5 h-3.5 text-[#8c909f]" />;
    }
  };

  const getEventBadgeStyle = (eventType: string) => {
    switch (eventType) {
      case 'CONTAINER_CREATED':
        return 'bg-[#4d8eff]/10 text-[#adc6ff] border-[#4d8eff]/30';
      case 'LOADED_ON_SHIP':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/30';
      case 'TEMPERATURE_SPIKE':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold';
      case 'ARRIVED_AT_PORT':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      case 'CUSTOMS_CLEARED':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-[#1c2b3c] text-[#d4e4fa] border-[#273647]';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#1c2b3c]">
      {events.map((event) => {
        const payload = event.payload || {};
        const isWarning = event.eventType === 'TEMPERATURE_SPIKE';

        return (
          <div key={event._id || `${event.aggregateId}-${event.version}`} className="relative group">
            {/* Stitch 8px Vertical Node */}
            <div
              className={`absolute -left-[30px] top-2 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                isWarning
                  ? 'bg-amber-950 border-[#f59e0b] text-[#f59e0b] shadow-lg ring-2 ring-[#f59e0b]/20'
                  : 'bg-[#0d1c2d] border-[#273647] group-hover:border-[#4d8eff] group-hover:scale-110'
              }`}
            >
              {getEventIcon(event.eventType)}
            </div>

            {/* Audit Log Card (Stitch Spec: 1px border #1c2b3c, instant hover transition) */}
            <div
              onClick={() => onSelectEvent(event)}
              className={`cursor-pointer p-4 rounded border transition-all ${
                isWarning
                  ? 'bg-gradient-to-r from-amber-950/20 via-[#122131] to-[#122131] border-amber-500/40 hover:border-amber-500/70'
                  : 'bg-[#122131] border-[#1c2b3c] hover:bg-[#1c2b3c] hover:border-[#273647]'
              } shadow-sm`}
            >
              {/* Card Header with Stitch [ STATE ] v1.0.4 Monospaced Format */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border font-mono uppercase tracking-wider ${getEventBadgeStyle(
                      event.eventType
                    )}`}
                  >
                    [ {event.eventType} ]
                  </span>

                  <span className="text-[11px] font-mono text-[#adc6ff] bg-[#010f1f] px-2 py-0.5 rounded border border-[#273647]">
                    v{event.version}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#8c909f] font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Payload Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-[#d4e4fa] mt-3 pt-2.5 border-t border-[#1c2b3c]/80 font-mono">
                {payload.location && (
                  <div className="flex items-center gap-1.5 text-[#d4e4fa]">
                    <MapPin className="w-3.5 h-3.5 text-[#4d8eff] shrink-0" />
                    <span className="truncate">{payload.location}</span>
                  </div>
                )}

                {payload.temperature !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <ThermometerSnowflake
                      className={`w-3.5 h-3.5 shrink-0 ${
                        payload.temperature > 0 ? 'text-rose-400' : 'text-cyan-400'
                      }`}
                    />
                    <span
                      className={`font-mono ${
                        isWarning ? 'text-[#f59e0b] font-bold' : 'text-[#d4e4fa]'
                      }`}
                    >
                      Temp: {payload.temperature}°C
                    </span>
                  </div>
                )}

                {payload.vessel && (
                  <div className="flex items-center gap-1.5 text-[#8c909f]">
                    <Ship className="w-3.5 h-3.5 text-[#8c909f] shrink-0" />
                    <span className="truncate">{payload.vessel}</span>
                  </div>
                )}

                {payload.operator && (
                  <div className="flex items-center gap-1.5 text-[#8c909f]">
                    <span className="text-[#8c909f]">Op:</span>
                    <span className="truncate text-[#d4e4fa]">{payload.operator}</span>
                  </div>
                )}
              </div>

              {payload.notes && (
                <div className="mt-2 text.5 text-xs text-amber-300/90 bg-amber-500/10 p-2 rounded border border-amber-500/20 font-mono">
                  {payload.notes}
                </div>
              )}

              {/* View Raw Payload Link */}
              <div className="mt-3 flex items-center justify-end gap-1 text-[11px] text-[#4d8eff] hover:underline font-mono">
                <Code2 className="w-3.5 h-3.5" />
                <span>View Full Event JSON Payload →</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
