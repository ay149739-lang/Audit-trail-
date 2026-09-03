import React from 'react';
import {
  PackagePlus,
  Ship,
  ThermometerSnowflake,
  Anchor,
  FileCheck2,
  CheckCircle2,
  Navigation,
  Clock,
  MapPin,
  Tag,
  Code2,
  AlertTriangle,
} from 'lucide-react';
import { IEvent } from '../types';

interface EventTimelineProps {
  events: IEvent[];
  onSelectEvent: (event: IEvent) => void;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events, onSelectEvent }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800 text-center">
        <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No events recorded in store for this aggregate yet.</p>
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'CONTAINER_CREATED':
        return <PackagePlus className="w-4 h-4 text-teal-400" />;
      case 'LOADED_ON_SHIP':
        return <Ship className="w-4 h-4 text-sky-400" />;
      case 'TEMPERATURE_SPIKE':
        return <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'ARRIVED_AT_PORT':
        return <Anchor className="w-4 h-4 text-indigo-400" />;
      case 'CUSTOMS_CLEARED':
        return <FileCheck2 className="w-4 h-4 text-purple-400" />;
      case 'DELIVERED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Navigation className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventBadgeStyle = (eventType: string) => {
    switch (eventType) {
      case 'CONTAINER_CREATED':
        return 'bg-teal-500/10 text-teal-300 border-teal-500/30';
      case 'LOADED_ON_SHIP':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/30';
      case 'TEMPERATURE_SPIKE':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-semibold';
      case 'ARRIVED_AT_PORT':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      case 'CUSTOMS_CLEARED':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
      {events.map((event, idx) => {
        const payload = event.payload || {};
        const isWarning = event.eventType === 'TEMPERATURE_SPIKE';

        return (
          <div key={event._id || `${event.aggregateId}-${event.version}`} className="relative group">
            {/* Timeline Dot */}
            <div
              className={`absolute -left-[31px] top-1.5 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                isWarning
                  ? 'bg-amber-950 border-amber-500 text-amber-400 shadow-lg shadow-amber-900/40 ring-4 ring-amber-500/10'
                  : 'bg-slate-900 border-slate-700 group-hover:border-teal-500 group-hover:scale-110'
              }`}
            >
              {getEventIcon(event.eventType)}
            </div>

            {/* Event Card */}
            <div
              onClick={() => onSelectEvent(event)}
              className={`cursor-pointer p-4 rounded-xl border transition-all ${
                isWarning
                  ? 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/40 hover:border-amber-500/70'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              } shadow-md`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border font-mono tracking-wide ${getEventBadgeStyle(
                      event.eventType
                    )}`}
                  >
                    {event.eventType}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                    Version #{event.version}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Payload Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800/60">
                {payload.location && (
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
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
                        isWarning ? 'text-amber-400 font-bold' : 'text-slate-200'
                      }`}
                    >
                      Temp: {payload.temperature}°C
                    </span>
                  </div>
                )}

                {payload.vessel && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Ship className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{payload.vessel}</span>
                  </div>
                )}

                {payload.operator && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Op: {payload.operator}</span>
                  </div>
                )}
              </div>

              {payload.notes && (
                <div className="mt-2 text-xs text-amber-300/90 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  {payload.notes}
                </div>
              )}

              {/* View Raw Payload Prompt */}
              <div className="mt-3 flex items-center justify-end gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-mono">
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
