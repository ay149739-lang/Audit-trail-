import React from 'react';
import {
  MapPin,
  Check,
  Ship,
  Anchor,
  Package,
  Clock,
  AlertTriangle,
  Building2,
  Navigation,
} from 'lucide-react';
import { ShipmentAggregate } from '../types';

interface RouteMilestoneProgressProps {
  shipment: ShipmentAggregate;
  isHistorical?: boolean;
}

interface Milestone {
  id: string;
  label: string;
  locationName: string;
  type: 'origin' | 'transit' | 'port' | 'destination';
  status: 'completed' | 'active' | 'pending';
}

export const RouteMilestoneProgress: React.FC<RouteMilestoneProgressProps> = ({
  shipment,
  isHistorical = false,
}) => {
  const events = shipment.events || [];

  // Extract any waypoint or port mentioned in events
  const portEvent = events.find(
    (e) => e.eventType === 'ARRIVED_AT_PORT' || e.eventType === 'CUSTOMS_CLEARED'
  );
  const waypointName =
    portEvent?.payload?.location ||
    (shipment.status === 'AT_PORT' || shipment.status === 'CUSTOMS_CLEARED'
      ? shipment.currentLocation
      : 'Port Waypoint');

  // Check for ETA in event payloads
  const etaEvent = events.find((e) => e.payload?.eta);
  const eta = etaEvent?.payload?.eta || (shipment as any).eta || null;

  // Determine stage active index (0 = origin, 1 = transit, 2 = port/customs, 3 = destination)
  let activeIndex = 0;
  if (shipment.status === 'CREATED') {
    activeIndex = 0;
  } else if (shipment.status === 'IN_TRANSIT') {
    activeIndex = 1;
  } else if (shipment.status === 'AT_PORT' || shipment.status === 'CUSTOMS_CLEARED') {
    activeIndex = 2;
  } else if (shipment.status === 'DELIVERED') {
    activeIndex = 3;
  } else if (shipment.status === 'WARNING') {
    // If warning, determine stage from current location or last non-warning event
    const loc = (shipment.currentLocation || '').toLowerCase();
    if (loc.includes((shipment.destination || '').toLowerCase())) {
      activeIndex = 3;
    } else if (loc.includes('port') || loc.includes('customs') || loc.includes('dock')) {
      activeIndex = 2;
    } else if (loc.includes((shipment.origin || '').toLowerCase())) {
      activeIndex = 0;
    } else {
      activeIndex = 1; // en route ocean transit
    }
  }

  const milestones: Milestone[] = [
    {
      id: 'origin',
      label: 'Origin Port',
      locationName: shipment.origin || 'Origin',
      type: 'origin',
      status: activeIndex > 0 ? 'completed' : activeIndex === 0 ? 'active' : 'pending',
    },
    {
      id: 'transit',
      label: 'Freight Transit',
      locationName: shipment.vessel ? `${shipment.carrier} (${shipment.vessel})` : shipment.carrier || 'Ocean Transit',
      type: 'transit',
      status: activeIndex > 1 ? 'completed' : activeIndex === 1 ? 'active' : 'pending',
    },
    {
      id: 'port',
      label: 'Port & Customs',
      locationName: waypointName,
      type: 'port',
      status: activeIndex > 2 ? 'completed' : activeIndex === 2 ? 'active' : 'pending',
    },
    {
      id: 'destination',
      label: 'Destination Port',
      locationName: shipment.destination || 'Destination',
      type: 'destination',
      status: shipment.status === 'DELIVERED' ? 'completed' : activeIndex === 3 ? 'active' : 'pending',
    },
  ];

  const getMilestoneIcon = (type: Milestone['type']) => {
    switch (type) {
      case 'origin':
        return <Building2 className="w-3 h-3" />;
      case 'transit':
        return <Ship className="w-3 h-3" />;
      case 'port':
        return <Anchor className="w-3 h-3" />;
      case 'destination':
        return <Package className="w-3 h-3" />;
      default:
        return <Navigation className="w-3 h-3" />;
    }
  };

  return (
    <div className="bg-[#FAF9F5] dark:bg-[#141414] p-4 rounded-md border border-[#DDDCD6] dark:border-[#333333] space-y-3 font-sans">
      {/* Top Header Row: Milestone Header & Live/Historical Location Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#252525] dark:text-[#F5F5F0] tracking-tight">
            Logistics Milestone Progression
          </span>
          <span className="font-mono text-[10px] text-[#6B6B66] dark:text-[#9E9E98] px-2 py-0.5 rounded bg-white dark:bg-[#1F1F1F] border border-[#DDDCD6] dark:border-[#333333]">
            {isHistorical ? 'Historical Position' : 'Real-time Progression'}
          </span>
        </div>

        {/* Current Location Badge */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] bg-white dark:bg-[#1F1F1F] px-2.5 py-1 rounded border border-[#DDDCD6] dark:border-[#333333] text-[#252525] dark:text-[#F5F5F0] shadow-xs">
          <MapPin className="w-3.5 h-3.5 text-[#E56B2F] dark:text-[#E5A93C] shrink-0" />
          <span className="text-[#6B6B66] dark:text-[#9E9E98]">Active Position:</span>
          <span className="font-bold text-[#E56B2F] dark:text-[#E5A93C] truncate max-w-[200px]">
            {shipment.currentLocation}
          </span>
        </div>
      </div>

      {/* Milestone Progression Rail */}
      <div className="relative pt-3 pb-1 px-1 overflow-x-auto">
        <div className="min-w-[320px] grid grid-cols-4 relative">
          {/* Continuous Connecting Line Behind Nodes */}
          <div className="absolute top-[13px] left-[12.5%] right-[12.5%] h-[2px] bg-[#DDDCD6] dark:bg-[#2F2F2F] -z-0">
            <div
              className="h-full bg-[#E56B2F] dark:bg-[#E5A93C] transition-all duration-300"
              style={{
                width:
                  activeIndex === 0
                    ? '0%'
                    : activeIndex === 1
                      ? '33.3%'
                      : activeIndex === 2
                        ? '66.6%'
                        : '100%',
              }}
            />
          </div>

          {milestones.map((m, idx) => {
            const isCompleted = m.status === 'completed';
            const isActive = m.status === 'active';
            const isPending = m.status === 'pending';
            const isAnomalyHere = isActive && shipment.status === 'WARNING';

            return (
              <div key={m.id} className="flex flex-col items-center text-center relative z-10 px-1">
                {/* Milestone Node Marker */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isCompleted
                      ? 'bg-[#3F8F6B] text-white shadow-xs'
                      : isActive
                        ? isAnomalyHere
                          ? 'bg-[#C94A4A] text-white ring-4 ring-[#C94A4A]/25'
                          : 'bg-[#E56B2F] dark:bg-[#E5A93C] text-white dark:text-[#141414] ring-4 ring-[#E56B2F]/20 dark:ring-[#E5A93C]/20 shadow-xs'
                        : 'bg-white dark:bg-[#1A1A1A] text-[#6B6B66] dark:text-[#666666] border border-[#DDDCD6] dark:border-[#333333]'
                    }`}
                  title={`${m.label}: ${m.locationName} (${m.status.toUpperCase()})`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    getMilestoneIcon(m.type)
                  )}
                </div>

                {/* Milestone Label */}
                <span
                  className={`mt-2 text-[10px] font-mono uppercase tracking-wider block ${isActive
                      ? 'text-[#E56B2F] dark:text-[#E5A93C] font-bold'
                      : isCompleted
                        ? 'text-[#3F8F6B] font-semibold'
                        : 'text-[#6B6B66] dark:text-[#777777]'
                    }`}
                >
                  {m.label}
                </span>

                {/* Location Name */}
                <span
                  className={`text-xs font-semibold mt-0.5 truncate max-w-full px-1 ${isActive
                      ? 'text-[#252525] dark:text-[#F5F5F0]'
                      : isCompleted
                        ? 'text-[#444444] dark:text-[#D4D4CE]'
                        : 'text-[#888882] dark:text-[#666666]'
                    }`}
                  title={m.locationName}
                >
                  {m.locationName}
                </span>

                {/* Active Indicator Flag */}
                {isActive && (
                  <span
                    className={`mt-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${isAnomalyHere
                        ? 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30'
                        : 'bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 text-[#E56B2F] dark:text-[#E5A93C] border-[#E56B2F]/30 dark:border-[#E5A93C]/30'
                      }`}
                  >
                    {isAnomalyHere ? 'ALERT HERE' : 'IN PROGRESS'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contextual Route Metadata Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#DDDCD6]/60 dark:border-[#333333]/60 text-[11px] font-sans text-[#6B6B66] dark:text-[#9E9E98]">
        <div>
          <span className="block text-[10px] text-[#888882] dark:text-[#666666]">CARRIER</span>
          <span className="font-semibold text-[#252525] dark:text-[#F5F5F0]">
            {shipment.carrier || 'N/A'}
          </span>
        </div>

        <div>
          <span className="block text-[10px] text-[#888882] dark:text-[#666666]">VESSEL</span>
          <span className="font-semibold text-[#252525] dark:text-[#F5F5F0]">
            {shipment.vessel || 'N/A'}
          </span>
        </div>

        <div>
          <span className="block text-[10px] text-[#888882] dark:text-[#666666]">CURRENT MILESTONE</span>
          <span className="font-semibold text-[#E56B2F] dark:text-[#E5A93C]">
            {milestones[activeIndex]?.label || 'In Transit'}
          </span>
        </div>

        <div>
          <span className="block text-[10px] text-[#888882] dark:text-[#666666]">ESTIMATED ARRIVAL</span>
          <span className="font-semibold text-[#252525] dark:text-[#F5F5F0]">
            {eta ? eta : 'Scheduled on Route'}
          </span>
        </div>
      </div>
    </div>
  );
};
