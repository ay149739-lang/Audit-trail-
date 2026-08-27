import {
  PackagePlus,
  Ship,
  ThermometerSun,
  Anchor,
  ShieldCheck,
  Activity
} from 'lucide-react';

export const EVENT_META = {
  CONTAINER_CREATED: {
    label: 'Container Created',
    icon: PackagePlus,
    badgeBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    border: 'border-teal-500/40',
    text: 'text-teal-600 dark:text-teal-400',
    dotBg: 'bg-teal-500',
    accentColor: '#14b8a6',
    description: 'Initial container setup & origin logging'
  },
  LOADED_ON_SHIP: {
    label: 'Loaded on Vessel',
    icon: Ship,
    badgeBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    border: 'border-sky-500/40',
    text: 'text-sky-600 dark:text-sky-400',
    dotBg: 'bg-sky-500',
    accentColor: '#0ea5e9',
    description: 'Container stowed on sea vessel'
  },
  TEMPERATURE_SPIKE: {
    label: 'Temperature Spike Alert',
    icon: ThermometerSun,
    badgeBg: 'bg-amber-500/15 dark:bg-amber-500/25',
    border: 'border-amber-500/50',
    text: 'text-amber-600 dark:text-amber-400',
    dotBg: 'bg-amber-500 animate-pulse',
    accentColor: '#f59e0b',
    isAlert: true,
    description: 'Sensor recorded temperature anomaly above threshold'
  },
  ARRIVED_AT_PORT: {
    label: 'Arrived at Port',
    icon: Anchor,
    badgeBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    border: 'border-indigo-500/40',
    text: 'text-indigo-600 dark:text-indigo-400',
    dotBg: 'bg-indigo-500',
    accentColor: '#6366f1',
    description: 'Vessel docked and container discharged'
  },
  CUSTOMS_CLEARED: {
    label: 'Customs Cleared',
    icon: ShieldCheck,
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    border: 'border-emerald-500/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    dotBg: 'bg-emerald-500',
    accentColor: '#10b981',
    description: 'Import customs clearance verified & approved'
  }
};

/**
 * Returns metadata object for a given eventType with fallbacks
 */
export const getEventMeta = (eventType) => {
  return (
    EVENT_META[eventType] || {
      label: eventType || 'Unknown Event',
      icon: Activity,
      badgeBg: 'bg-slate-500/10 dark:bg-slate-500/20',
      border: 'border-slate-500/40',
      text: 'text-slate-600 dark:text-slate-400',
      dotBg: 'bg-slate-500',
      accentColor: '#64748b',
      description: 'System event log entry'
    }
  );
};
