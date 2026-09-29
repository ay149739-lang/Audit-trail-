import React from 'react';
import {
  Package,
  Ship,
  MapPin,
  AlertTriangle,
  Anchor,
  FileCheck,
  CheckCircle2,
  Navigation,
  ThermometerSnowflake,
  Clock,
  Lock,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { IEvent } from '../types';

interface EventTimelineProps {
  events: IEvent[];
  selectedEvent: IEvent | null;
  onSelectEvent: (event: IEvent) => void;
  activeVersionCutoff?: number;
  latestVersion?: number;
}

// Map event types to icon and color scheme
const getEventMeta = (eventType: string) => {
  switch (eventType) {
    case 'CONTAINER_CREATED':
      return {
        icon: Package,
        color: 'text-[#E56B2F] dark:text-[#E5A93C]',
        bg: 'bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10',
        border: 'border-[#E56B2F]/30 dark:border-[#E5A93C]/30',
        status: 'CREATED',
        statusColor: 'bg-[#E56B2F]/10 text-[#E56B2F] dark:text-[#E5A93C] border-[#E56B2F]/30',
      };
    case 'LOADED_ON_SHIP':
      return {
        icon: Ship,
        color: 'text-[#3A8B88] dark:text-[#3A8B88]',
        bg: 'bg-[#3A8B88]/10 dark:bg-[#3A8B88]/10',
        border: 'border-[#3A8B88]/30 dark:border-[#3A8B88]/30',
        status: 'LOADED',
        statusColor: 'bg-[#3A8B88]/10 text-[#3A8B88] border-[#3A8B88]/30',
      };
    case 'MOVED_LOCATION':
      return {
        icon: Navigation,
        color: 'text-[#3A8B88] dark:text-[#3A8B88]',
        bg: 'bg-[#3A8B88]/10 dark:bg-[#3A8B88]/10',
        border: 'border-[#3A8B88]/30 dark:border-[#3A8B88]/30',
        status: 'IN_TRANSIT',
        statusColor: 'bg-[#3A8B88]/10 text-[#3A8B88] border-[#3A8B88]/30',
      };
    case 'TEMPERATURE_SPIKE':
      return {
        icon: AlertTriangle,
        color: 'text-[#C94A4A]',
        bg: 'bg-[#C94A4A]/10',
        border: 'border-[#C94A4A]/40 ring-2 ring-[#C94A4A]/20',
        status: 'WARNING',
        statusColor: 'bg-[#C94A4A]/15 text-[#C94A4A] border-[#C94A4A]/40 font-bold',
      };
    case 'ARRIVED_AT_PORT':
      return {
        icon: Anchor,
        color: 'text-[#D9A441] dark:text-[#E5A93C]',
        bg: 'bg-[#D9A441]/10 dark:bg-[#E5A93C]/10',
        border: 'border-[#D9A441]/30 dark:border-[#E5A93C]/30',
        status: 'AT_PORT',
        statusColor: 'bg-[#D9A441]/10 text-[#D9A441] dark:text-[#E5A93C] border-[#D9A441]/30',
      };
    case 'CUSTOMS_CLEARED':
    case 'INSPECTION_PASSED':
      return {
        icon: FileCheck,
        color: 'text-[#3F8F6B]',
        bg: 'bg-[#3F8F6B]/10',
        border: 'border-[#3F8F6B]/30',
        status: 'CUSTOMS_CLEARED',
        statusColor: 'bg-[#3F8F6B]/10 text-[#3F8F6B] border-[#3F8F6B]/30',
      };
    case 'DELIVERED':
      return {
        icon: CheckCircle2,
        color: 'text-[#3F8F6B]',
        bg: 'bg-[#3F8F6B]/15',
        border: 'border-[#3F8F6B]/40 ring-1 ring-[#3F8F6B]/20',
        status: 'DELIVERED',
        statusColor: 'bg-[#3F8F6B]/15 text-[#3F8F6B] border-[#3F8F6B]/40 font-bold',
      };
    default:
      return {
        icon: Package,
        color: 'text-[#6B6B66] dark:text-[#9E9E98]',
        bg: 'bg-[#FAF9F5] dark:bg-[#141414]',
        border: 'border-[#DDDCD6] dark:border-[#333333]',
        status: 'LOGGED',
        statusColor: 'bg-[#FAF9F5] dark:bg-[#141414] text-[#6B6B66] dark:text-[#9E9E98] border-[#DDDCD6] dark:border-[#333333]',
      };
  }
};

// Generate clear human-readable short description for audit logs
const getEventShortDescription = (event: IEvent): string => {
  const p = event.payload || {};
  if (p.notes) return p.notes;

  switch (event.eventType) {
    case 'CONTAINER_CREATED':
      return `Container aggregate initialized. Origin: ${p.origin || 'Depot'} • Destination: ${p.destination || 'Terminal'}${p.cargoType ? ` • Cargo: ${p.cargoType}` : ''
        }`;
    case 'LOADED_ON_SHIP':
      return `Container stowed aboard ${p.vessel || 'vessel'}${p.grossWeightKg ? ` (${p.grossWeightKg.toLocaleString()} kg)` : ''
        }${p.sealNumber ? ` • Seal: ${p.sealNumber}` : ''}`;
    case 'TEMPERATURE_SPIKE':
      return `Temperature exceeded threshold! Sensor: ${p.sensorId || 'Telemetry'} • Temp: ${p.temperature}°C${p.threshold ? ` (Threshold: ${p.threshold}°C)` : ''
        }`;
    case 'MOVED_LOCATION':
      return `Position update logged at ${p.location || 'waypoint'}${p.speedKnots ? ` • Speed: ${p.speedKnots} kts` : ''
        }`;
    case 'ARRIVED_AT_PORT':
      return `Vessel berthed at ${p.location || 'harbor'}, awaiting clearance inspection`;
    case 'CUSTOMS_CLEARED':
      return `Port customs cleared${p.clearanceCode ? ` • Authorization: ${p.clearanceCode}` : ''}`;
    case 'INSPECTION_PASSED':
      return `Regulatory and biosecurity inspection verified passed`;
    case 'DELIVERED':
      return `Final delivery completed to consignee${p.recipientSignature ? ` • Signed by: ${p.recipientSignature}` : ''
        }`;
    default:
      return `Domain event ${event.eventType} persisted to ledger`;
  }
};

// Format timestamp into professional enterprise format: "29 Sep 2026 • 14:32"
const formatEventDate = (timestamp: string | Date | undefined): string => {
  if (!timestamp) return 'Timestamp unavailable';
  const d = new Date(timestamp);
  const day = d.getDate();
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${day} ${month} ${year} • ${hours}:${minutes}:${seconds}`;
};

export const EventTimeline: React.FC<EventTimelineProps> = ({
  events = [],
  selectedEvent,
  onSelectEvent,
  activeVersionCutoff,
  latestVersion = 1,
}) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-8 bg-[#FAF9F5] dark:bg-[#141414] rounded-md border border-[#DDDCD6] dark:border-[#333333] text-center font-sans space-y-1">
        <Clock className="w-6 h-6 text-[#6B6B66] dark:text-[#9E9E98] mx-auto mb-2 opacity-50" />
        <p className="font-mono text-xs font-bold text-[#252525] dark:text-[#F5F5F0]">No recent activity</p>
        <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] font-mono">
          New immutable events will appear here as shipments are processed.
        </p>
      </div>
    );
  }

  return (
    <div className="relative font-sans space-y-2">
      {/* Immutability Banner */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#FAF9F5] dark:bg-[#141414] rounded border border-[#DDDCD6] dark:border-[#333333] text-[10px] font-mono text-[#6B6B66] dark:text-[#9E9E98]">
        <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-[#252525] dark:text-[#F5F5F0]">
          <Lock className="w-3 h-3 text-[#3F8F6B]" />
          <span>Audit Store</span>
          <span>•</span>
          <span className="text-[#3F8F6B]">Append-Only</span>
          <span>•</span>
          <span className="text-[#3A8B88]">✓ Immutable Events</span>
        </div>
        <span className="hidden sm:inline text-[#6B6B66] dark:text-[#9E9E98]">
          No mutation/deletion permitted
        </span>
      </div>

      {/* Vertical Timeline Rail Spine */}
      <div className="relative pl-7 space-y-3 pt-1">
        <div className="absolute left-[13px] top-3 bottom-3 w-[2px] bg-[#DDDCD6] dark:bg-[#2F2F32] z-0" />

        {events.map((event, index) => {
          const payload = event.payload || {};
          const isWarning = event.eventType === 'TEMPERATURE_SPIKE';
          const isSelected = selectedEvent?.version === event.version;
          const isDimmed = activeVersionCutoff !== undefined && event.version > activeVersionCutoff;
          const isLatestEvent = event.version === latestVersion;
          const isCutoffPoint =
            activeVersionCutoff !== undefined &&
            event.version === activeVersionCutoff &&
            index < events.length - 1 &&
            events[index + 1]?.version > activeVersionCutoff;

          const meta = getEventMeta(event.eventType);
          const IconComponent = meta.icon;
          const location = payload.location || payload.origin || payload.destination;
          const temp = payload.temperature;
          const description = getEventShortDescription(event);

          return (
            <React.Fragment key={event._id || `${event.aggregateId}-${event.version}`}>
              <div
                onClick={() => onSelectEvent(event)}
                role="button"
                tabIndex={0}
                aria-selected={isSelected}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectEvent(event);
                  }
                }}
                className={`relative group rounded-md p-3 transition-all cursor-pointer border text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] ${isDimmed
                  ? 'opacity-35 hover:opacity-70 border-transparent bg-transparent'
                  : isSelected
                    ? 'bg-white dark:bg-[#222225] border-[#E56B2F] dark:border-[#E5A93C] shadow-md ring-1 ring-[#E56B2F]/20 dark:ring-[#E5A93C]/20'
                    : isWarning
                      ? 'bg-[#C94A4A]/5 hover:bg-[#C94A4A]/10 border-[#C94A4A]/30 hover:border-[#C94A4A]/50'
                      : 'bg-white/80 dark:bg-[#1A1A1D] border-[#DDDCD6]/80 dark:border-[#333333] hover:border-[#C8C5BB] dark:hover:border-[#4A4A4F] hover:shadow-xs'
                  }`}
              >
                {/* Node Marker on Spine */}
                <div
                  className={`absolute -left-7 top-3.5 w-6 h-6 rounded-full border flex items-center justify-center transition-all z-10 ${isDimmed
                    ? 'bg-[#DDDCD6] dark:bg-[#2F2F32] border-transparent text-[#888888] opacity-50'
                    : isWarning
                      ? 'bg-[#C94A4A] text-white border-white shadow-sm ring-2 ring-[#C94A4A]/30'
                      : isSelected
                        ? 'bg-[#E56B2F] dark:bg-[#E5A93C] text-white dark:text-[#141414] border-white shadow-sm ring-2 ring-[#E56B2F]/25 dark:ring-[#E5A93C]/25'
                        : `${meta.bg} ${meta.color} ${meta.border} bg-white dark:bg-[#1A1A1D]`
                    }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>

                {/* Event Card Content */}
                <div className="space-y-1.5">
                  {/* Top Bar: Event Type, Version, Status Badge, Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#DDDCD6] dark:border-[#333333] bg-[#FAF9F5] dark:bg-[#141414] text-[#252525] dark:text-[#F5F5F0] shrink-0">
                        v{event.version}
                      </span>

                      <span
                        className={`font-bold text-xs tracking-tight truncate ${isWarning
                          ? 'text-[#C94A4A]'
                          : isSelected
                            ? 'text-[#E56B2F] dark:text-[#E5A93C]'
                            : 'text-[#252525] dark:text-[#F5F5F0]'
                          }`}
                      >
                        {event.eventType}
                      </span>

                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold shrink-0 ${meta.statusColor}`}
                      >
                        {payload.status || meta.status}
                      </span>

                      {isLatestEvent && !activeVersionCutoff && (
                        <span className="hidden sm:inline-flex text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#3F8F6B]/15 text-[#3F8F6B] border border-[#3F8F6B]/30 tracking-wider">
                          HEAD
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 font-mono text-[11px] text-[#6B6B66] dark:text-[#9E9E98] shrink-0">
                      <Clock className="w-3 h-3 text-[#888888]" />
                      <span>{formatEventDate(event.timestamp)}</span>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-[11px] text-[#4A4A45] dark:text-[#CCCCCC] leading-relaxed font-sans">
                    {description}
                  </p>

                  {/* Bottom Metadata Ribbon (Location, Sensor Reading, Operator) */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#6B6B66] dark:text-[#9E9E98] font-mono border-t border-[#DDDCD6]/40 dark:border-[#333333]/40">
                    {location && (
                      <span className="inline-flex items-center gap-1 truncate max-w-[260px]">
                        <MapPin className="w-3 h-3 text-[#E56B2F] dark:text-[#E5A93C] shrink-0" />
                        <span className="truncate">{location}</span>
                      </span>
                    )}

                    {temp !== undefined && (
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${temp > 25 || temp < -15 ? 'text-[#C94A4A]' : 'text-[#3F8F6B]'
                          }`}
                      >
                        <ThermometerSnowflake className="w-3 h-3 shrink-0" />
                        <span>{temp}°C</span>
                      </span>
                    )}

                    {payload.operator && (
                      <span className="text-[10px] text-[#888888] truncate max-w-[180px]">
                        Actor: {payload.operator}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Historical Cutoff Boundary */}
              {isCutoffPoint && (
                <div className="flex items-center gap-2 py-2 px-1 text-[10px] font-mono text-[#D9A441] dark:text-[#E5A93C] my-1">
                  <div className="h-px flex-1 border-t border-dashed border-[#D9A441]/40 dark:border-[#E5A93C]/40" />
                  <span className="px-2.5 py-0.5 rounded bg-[#D9A441]/10 dark:bg-[#E5A93C]/10 border border-[#D9A441]/30 dark:border-[#E5A93C]/30 font-bold uppercase tracking-wider">
                    Scrubber Cutoff: Events after v{activeVersionCutoff} Excluded from Historical State
                  </span>
                  <div className="h-px flex-1 border-t border-dashed border-[#D9A441]/40 dark:border-[#E5A93C]/40" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
