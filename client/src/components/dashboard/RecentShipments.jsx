import React, { useEffect } from 'react';
import { History, Tag, ChevronRight } from 'lucide-react';
import { useShipmentStore } from '../../store/useShipmentStore';

export const RecentShipments = () => {
  const { recentShipments, fetchRecentShipments, searchShipment, searchedId } =
    useShipmentStore();

  useEffect(() => {
    fetchRecentShipments();
  }, [fetchRecentShipments]);

  if (!recentShipments || recentShipments.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium mr-1">
        <History className="w-3.5 h-3.5 text-teal-500" />
        <span>Recent Activity:</span>
      </div>

      {recentShipments.map((item) => {
        const isSelected = item.aggregateId === searchedId;
        return (
          <button
            key={item.aggregateId}
            onClick={() => searchShipment(item.aggregateId)}
            className={`px-3 py-1.5 rounded-full font-mono font-medium transition-all duration-200 flex items-center gap-1.5 border shadow-sm ${
              isSelected
                ? 'bg-teal-500 text-white border-teal-500 shadow-teal-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-teal-500/40 hover:text-teal-600 dark:hover:text-teal-400'
            }`}
          >
            <Tag className="w-3 h-3 opacity-70" />
            <span>{item.aggregateId}</span>
            <span className="text-[10px] opacity-60 font-sans">
              ({item.eventCount} {item.eventCount === 1 ? 'event' : 'events'})
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default RecentShipments;
