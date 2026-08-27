import React from 'react';
import TimelineNode from './TimelineNode';
import TimelineSkeleton from './TimelineSkeleton';
import { useShipmentStore } from '../../store/useShipmentStore';
import { GitBranch, AlertTriangle } from 'lucide-react';

export const EventTimeline = () => {
  const { events, isLoading, error, searchedId } = useShipmentStore();

  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto my-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-center font-mono text-sm space-y-2">
        <AlertTriangle className="w-6 h-6 mx-auto text-red-500" />
        <p className="font-bold">{error}</p>
        <p className="text-xs opacity-80">
          Double check the shipment ID or try searching for sample "SHIP-1001" or "SHIP-1002".
        </p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-6 animate-fadeIn">
      {/* Timeline Section Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <GitBranch className="w-5 h-5 text-teal-500" />
          <h3 className="font-bold text-base tracking-tight">
            Immutable Event Stream ({events.length} {events.length === 1 ? 'event' : 'events'})
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
          Ordered Chronologically (v1 → v{events.length})
        </span>
      </div>

      {/* Vertical Connected Nodes */}
      <div className="space-y-1">
        {events.map((event, idx) => (
          <TimelineNode
            key={event._id || `${event.aggregateId}-${event.version}`}
            event={event}
            index={idx}
            totalEvents={events.length}
          />
        ))}
      </div>
    </div>
  );
};

export default EventTimeline;
