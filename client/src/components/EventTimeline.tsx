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
      <div className="p-8 bg-[#FAF9F5] rounded-md border border-[#DDDCD6] text-center">
        <Clock className="w-8 h-8 text-[#6B6B66] mx-auto mb-2" />
        <p className="text-sm text-[#6B6B66] font-mono">No events recorded in store for this aggregate yet.</p>
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'CONTAINER_CREATED':
        return <PackagePlus className="w-4 h-4 text-[#E56B2F]" />;
      case 'LOADED_ON_SHIP':
        return <Ship className="w-4 h-4 text-[#D9A441]" />;
      case 'TEMPERATURE_SPIKE':
        return <AlertTriangle className="w-4 h-4 text-[#C94A4A] animate-pulse" />;
      case 'ARRIVED_AT_PORT':
        return <Anchor className="w-4 h-4 text-[#7E6B5A]" />;
      case 'CUSTOMS_CLEARED':
        return <FileCheck2 className="w-4 h-4 text-[#3F8F6B]" />;
      case 'DELIVERED':
        return <CheckCircle2 className="w-4 h-4 text-[#3F8F6B]" />;
      default:
        return <Navigation className="w-4 h-4 text-[#6B6B66]" />;
    }
  };

  const getEventBadgeStyle = (eventType: string) => {
    switch (eventType) {
      case 'CONTAINER_CREATED':
        return 'bg-[#E56B2F]/10 text-[#E56B2F] border-[#E56B2F]/30';
      case 'LOADED_ON_SHIP':
        return 'bg-[#D9A441]/10 text-[#D9A441] border-[#D9A441]/30';
      case 'TEMPERATURE_SPIKE':
        return 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30 font-bold';
      case 'ARRIVED_AT_PORT':
        return 'bg-[#7E6B5A]/10 text-[#7E6B5A] border-[#7E6B5A]/30';
      case 'CUSTOMS_CLEARED':
        return 'bg-[#3F8F6B]/10 text-[#3F8F6B] border-[#3F8F6B]/30';
      case 'DELIVERED':
        return 'bg-[#3F8F6B]/10 text-[#3F8F6B] border-[#3F8F6B]/30';
      default:
        return 'bg-[#FAF9F5] text-[#252525] border-[#DDDCD6]';
    }
  };

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#DDDCD6]">
      {events.map((event) => {
        const payload = event.payload || {};
        const isWarning = event.eventType === 'TEMPERATURE_SPIKE';

        return (
          <div key={event._id || `${event.aggregateId}-${event.version}`} className="relative group">
            {/* Timeline Dot */}
            <div
              className={`absolute -left-[31px] top-1.5 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                isWarning
                  ? 'bg-[#C94A4A]/10 border-[#C94A4A] text-[#C94A4A] shadow-xs ring-4 ring-[#C94A4A]/10'
                  : 'bg-white border-[#DDDCD6] group-hover:border-[#E56B2F] group-hover:scale-110'
              }`}
            >
              {getEventIcon(event.eventType)}
            </div>

            {/* Event Card */}
            <div
              onClick={() => onSelectEvent(event)}
              className={`cursor-pointer p-4 rounded-md border transition-all ${
                isWarning
                  ? 'bg-[#C94A4A]/5 border-[#C94A4A]/30 hover:border-[#C94A4A]/60'
                  : 'bg-white border-[#DDDCD6] hover:border-[#B8B7B0] hover:bg-[#FAF9F5]'
              } shadow-xs`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border font-mono tracking-wide ${getEventBadgeStyle(
                      event.eventType
                    )}`}
                  >
                    {event.eventType}
                  </span>

                  <span className="text-[11px] font-mono text-[#252525] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#DDDCD6]">
                    Version #{event.version}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#6B6B66] font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#6B6B66]" />
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Payload Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-[#252525] mt-3 pt-3 border-t border-[#DDDCD6]/60">
                {payload.location && (
                  <div className="flex items-center gap-1.5 text-[#252525]">
                    <MapPin className="w-3.5 h-3.5 text-[#E56B2F] shrink-0" />
                    <span className="truncate">{payload.location}</span>
                  </div>
                )}

                {payload.temperature !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <ThermometerSnowflake
                      className={`w-3.5 h-3.5 shrink-0 ${
                        payload.temperature > 0 ? 'text-[#C94A4A]' : 'text-[#252525]'
                      }`}
                    />
                    <span
                      className={`font-mono ${
                        isWarning ? 'text-[#C94A4A] font-bold' : 'text-[#252525]'
                      }`}
                    >
                      Temp: {payload.temperature}°C
                    </span>
                  </div>
                )}

                {payload.vessel && (
                  <div className="flex items-center gap-1.5 text-[#6B6B66]">
                    <Ship className="w-3.5 h-3.5 text-[#6B6B66] shrink-0" />
                    <span className="truncate">{payload.vessel}</span>
                  </div>
                )}

                {payload.operator && (
                  <div className="flex items-center gap-1.5 text-[#6B6B66]">
                    <span className="truncate">Op: {payload.operator}</span>
                  </div>
                )}
              </div>

              {payload.notes && (
                <div className="mt-2 text-xs text-[#C94A4A] bg-[#C94A4A]/10 p-2 rounded border border-[#C94A4A]/20">
                  {payload.notes}
                </div>
              )}

              {/* View Raw Payload Prompt */}
              <div className="mt-3 flex items-center justify-end gap-1 text-[11px] text-[#E56B2F] hover:underline font-mono font-semibold">
                <Code2 className="w-3.5 h-3.5" />
                <span>View Full Immutable Payload JSON →</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
