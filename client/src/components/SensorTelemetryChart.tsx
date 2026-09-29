import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  ThermometerSnowflake,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldAlert,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { IEvent } from '../types';

interface SensorTelemetryChartProps {
  events: IEvent[];
  selectedEvent: IEvent | null;
  onSelectEvent: (event: IEvent) => void;
  aggregateId: string;
  activeVersionCutoff?: number;
  height?: number;
}

interface TelemetryPoint {
  version: number;
  eventType: string;
  shortLabel: string;
  fullEventType: string;
  temperature: number;
  threshold?: number;
  targetTemp?: number;
  location: string;
  timestamp: string;
  operator?: string;
  notes?: string;
  isSpike: boolean;
  isDimmed: boolean;
  isSelected: boolean;
  event: IEvent;
}

// Friendly milestone labels for X-Axis
const getShortEventLabel = (type: string, version: number): string => {
  switch (type) {
    case 'CONTAINER_CREATED':
      return `v${version} Created`;
    case 'LOADED_ON_SHIP':
      return `v${version} Loaded`;
    case 'MOVED_LOCATION':
      return `v${version} Transit`;
    case 'TEMPERATURE_SPIKE':
      return `v${version} SPIKE`;
    case 'ARRIVED_AT_PORT':
      return `v${version} Port`;
    case 'CUSTOMS_CLEARED':
      return `v${version} Customs`;
    case 'INSPECTION_PASSED':
      return `v${version} Inspected`;
    case 'DELIVERED':
      return `v${version} Delivered`;
    default:
      return `v${version} ${type.replace(/_/g, ' ').toLowerCase()}`;
  }
};

export const SensorTelemetryChart: React.FC<SensorTelemetryChartProps> = ({
  events = [],
  selectedEvent,
  onSelectEvent,
  aggregateId,
  activeVersionCutoff,
  height = 240,
}) => {
  // Extract and compute sensor telemetry points from events
  const { chartData, thresholdValue, hasSpike, temps } = useMemo(() => {
    if (!events || events.length === 0) {
      return { chartData: [], thresholdValue: undefined, hasSpike: false, temps: [] };
    }

    let detectedThreshold: number | undefined = undefined;
    let baseTargetTemp: number | undefined = undefined;
    let lastKnownTemp = 20.0;
    let anySpike = false;

    // First scan for targetTemp
    const createdEvent = events.find(
      (e) => e.eventType === 'CONTAINER_CREATED' && e.payload?.targetTemp !== undefined
    );
    if (createdEvent?.payload?.targetTemp !== undefined) {
      baseTargetTemp = createdEvent.payload.targetTemp;
      lastKnownTemp = Number(baseTargetTemp);
    }

    // Process all events chronologically
    const points: TelemetryPoint[] = events.map((event) => {
      const p = event.payload || {};
      const isSpike =
        event.eventType === 'TEMPERATURE_SPIKE' ||
        (p.threshold !== undefined && p.temperature !== undefined && p.temperature > p.threshold);

      if (isSpike) anySpike = true;
      if (p.threshold !== undefined) detectedThreshold = p.threshold;

      let temp: number = lastKnownTemp;
      if (p.temperature !== undefined) {
        temp = Number(p.temperature);
        lastKnownTemp = temp;
      } else if (p.targetTemp !== undefined) {
        temp = Number(p.targetTemp);
        lastKnownTemp = temp;
      }

      const isDimmed = activeVersionCutoff !== undefined && event.version > activeVersionCutoff;
      const isSelected = selectedEvent?.version === event.version;
      const location = p.location || p.origin || p.destination || 'In Transit';

      return {
        version: event.version,
        eventType: event.eventType,
        shortLabel: getShortEventLabel(event.eventType, event.version),
        fullEventType: event.eventType,
        temperature: temp,
        threshold: p.threshold,
        targetTemp: baseTargetTemp,
        location,
        timestamp: event.timestamp,
        operator: p.operator,
        notes: p.notes,
        isSpike,
        isDimmed,
        isSelected,
        event,
      };
    });

    const computedTemps = points.map((d) => d.temperature);
    if (detectedThreshold !== undefined) computedTemps.push(detectedThreshold);

    return {
      chartData: points,
      thresholdValue: detectedThreshold,
      hasSpike: anySpike,
      temps: computedTemps,
    };
  }, [events, selectedEvent, activeVersionCutoff]);

  if (chartData.length === 0) {
    return (
      <div className="p-8 bg-[#FAF9F5] dark:bg-[#141414] rounded-md border border-[#DDDCD6] dark:border-[#333333] text-center font-sans">
        <ThermometerSnowflake className="w-6 h-6 text-[#6B6B66] dark:text-[#9E9E98] mx-auto mb-2 opacity-50" />
        <p className="font-mono text-xs font-bold text-[#252525] dark:text-[#F5F5F0]">No Telemetry Stream</p>
        <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98]">
          Sensor metrics will automatically render as events are recorded.
        </p>
      </div>
    );
  }

  // Calculate min and max for chart YAxis (temps already computed in useMemo)
  const minTemp = temps.length > 0 ? Math.floor(Math.min(...temps) - 3) : 15;
  const maxTemp = temps.length > 0 ? Math.ceil(Math.max(...temps) + 3) : 35;

  // Custom Dot Renderer with Overlays for Special Events (Spikes, Milestones, Selection)
  const renderCustomDot = (props: any): React.ReactElement<SVGElement> => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return <g />;

    const isSelected = payload.isSelected;
    const isSpike = payload.isSpike;
    const isDimmed = payload.isDimmed;

    if (isDimmed) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={3}
          fill="none"
          stroke="#888888"
          strokeWidth={1}
          strokeDasharray="2 2"
          opacity={0.4}
        />
      );
    }

    if (isSpike) {
      return (
        <g
          className="cursor-pointer transition-transform hover:scale-125"
          onClick={() => onSelectEvent(payload.event)}
        >
          {/* Subtle pulse aura */}
          <circle cx={cx} cy={cy} r={10} fill="#C94A4A" fillOpacity={0.2} className="animate-ping" />
          <circle cx={cx} cy={cy} r={6} fill="#C94A4A" stroke="#FFFFFF" strokeWidth={2} />
          {/* Visual Anomaly Badge on top of point */}
          <rect
            x={cx - 18}
            y={cy - 22}
            width={36}
            height={14}
            rx={3}
            fill="#C94A4A"
            className="filter drop-shadow-xs"
          />
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="8"
            fontWeight="bold"
            fontFamily="monospace"
          >
            SPIKE
          </text>
        </g>
      );
    }

    if (isSelected) {
      return (
        <g
          className="cursor-pointer"
          onClick={() => onSelectEvent(payload.event)}
        >
          <circle cx={cx} cy={cy} r={8} fill="#E56B2F" fillOpacity={0.25} />
          <circle cx={cx} cy={cy} r={5} fill="#E56B2F" stroke="#FFFFFF" strokeWidth={2} />
        </g>
      );
    }

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#3F8F6B"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        className="cursor-pointer transition-all"
        onClick={() => onSelectEvent(payload.event)}
      />
    );
  };

  // Custom Enterprise Tooltip Component
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data: TelemetryPoint = payload[0].payload;

    return (
      <div className="bg-[#1C1C1F] dark:bg-[#18181B] text-[#F5F5F0] p-3 rounded-md border border-[#38383C] shadow-xl font-sans text-xs space-y-2 max-w-xs z-50">
        <div className="flex items-center justify-between border-b border-[#2C2C30] pb-1.5 gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${data.isSpike ? 'bg-[#C94A4A] animate-pulse' : 'bg-[#3F8F6B]'
                }`}
            />
            <span className="font-bold font-mono tracking-tight text-[11px] text-[#E5A93C]">
              {data.fullEventType}
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2A2A2E] text-[#9E9E98] border border-[#3A3A3E]">
            v{data.version}
          </span>
        </div>

        {/* Telemetry Readout */}
        <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px]">
          <div>
            <span className="text-[#8E8E93] text-[10px] block">Temperature:</span>
            <span
              className={`font-mono font-bold text-sm flex items-center gap-1 ${data.isSpike ? 'text-[#C94A4A]' : 'text-[#3F8F6B]'
                }`}
            >
              <ThermometerSnowflake className="w-3.5 h-3.5" />
              {data.temperature.toFixed(1)}°C
            </span>
          </div>

          <div>
            <span className="text-[#8E8E93] text-[10px] block">Shipment ID:</span>
            <span className="font-mono font-semibold text-[#F5F5F0]">#{aggregateId}</span>
          </div>
        </div>

        {/* Location & Threshold Info */}
        <div className="space-y-1 text-[11px] pt-1 border-t border-[#2C2C30] text-[#D1D1D6]">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 text-[#E5A93C] shrink-0" />
            <span className="truncate">{data.location}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#8E8E93]">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{new Date(data.timestamp).toLocaleString()}</span>
          </div>

          {data.isSpike && (
            <div className="mt-1 p-1.5 rounded bg-[#C94A4A]/20 border border-[#C94A4A]/40 text-[#FFA3A3] text-[10px] flex items-start gap-1">
              <AlertTriangle className="w-3 h-3 text-[#C94A4A] shrink-0 mt-0.5" />
              <span>
                {data.notes || 'Sensor exceeded safe cold-chain operating parameters!'}
              </span>
            </div>
          )}
        </div>

        <div className="pt-1 text-[10px] text-[#8E8E93] italic font-sans">
          Click event point to inspect in audit ledger
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#1F1F1F] p-5 rounded-md border border-[#DDDCD6] dark:border-[#333333] shadow-sm space-y-3 font-sans">
      {/* Chart Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDDCD6]/60 dark:border-[#333333]/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#E56B2F]/10 dark:bg-[#E5A93C]/10 flex items-center justify-center text-[#E56B2F] dark:text-[#E5A93C]">
            <ThermometerSnowflake className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-sm">
                Sensor Telemetry &amp; Event Overlay
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#DDDCD6] dark:border-[#333333] bg-[#FAF9F5] dark:bg-[#141414] text-[#4A4A45] dark:text-[#9E9E98]">
                Recharts • Cold Chain Telemetry
              </span>
            </div>
            <p className="text-xs text-[#4A4A45] dark:text-[#9E9E98] mt-0.5">
              Temperature trajectory overlaid against {chartData.length} timeline milestones
            </p>
          </div>
        </div>

        {/* Legend / Status Indicators */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-[#3F8F6B]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3F8F6B]" />
            <span>Telemetry Reading</span>
          </div>

          {hasSpike && (
            <div className="flex items-center gap-1.5 text-[#C94A4A] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C94A4A] animate-pulse" />
              <span>Temperature Spike Event</span>
            </div>
          )}

          {thresholdValue !== undefined && (
            <div className="flex items-center gap-1.5 text-[#D9A441] dark:text-[#E5A93C]">
              <span className="w-3 h-0.5 border-t border-dashed border-[#D9A441] dark:border-[#E5A93C]" />
              <span>Threshold: {thresholdValue}°C</span>
            </div>
          )}

          {activeVersionCutoff !== undefined && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D9A441]/10 text-[#D9A441] dark:text-[#E5A93C] border border-[#D9A441]/30">
              Cutoff: v{activeVersionCutoff}
            </span>
          )}
        </div>
      </div>

      {/* Main Recharts Area */}
      <div style={{ width: '100%', height }} className="pt-2 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload.length) {
                const pt = e.activePayload[0].payload as TelemetryPoint;
                if (pt && pt.event) onSelectEvent(pt.event);
              }
            }}
          >
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={hasSpike ? '#C94A4A' : '#E56B2F'}
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor={hasSpike ? '#C94A4A' : '#E56B2F'}
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#888888"
              strokeOpacity={0.15}
              vertical={false}
            />

            <XAxis
              dataKey="shortLabel"
              tickLine={false}
              axisLine={{ stroke: '#888888', strokeOpacity: 0.2 }}
              tick={{ fill: '#888888', fontSize: 11, fontFamily: 'monospace' }}
              interval={0}
            />

            <YAxis
              domain={[minTemp, maxTemp]}
              tickLine={false}
              axisLine={{ stroke: '#888888', strokeOpacity: 0.2 }}
              tick={{ fill: '#888888', fontSize: 11, fontFamily: 'monospace' }}
              unit="°C"
              width={45}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Threshold Reference Line if specified */}
            {thresholdValue !== undefined && (
              <ReferenceLine
                y={thresholdValue}
                stroke="#C94A4A"
                strokeDasharray="4 4"
                label={{
                  value: `Limit: ${thresholdValue}°C`,
                  fill: '#C94A4A',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  position: 'insideTopRight',
                }}
              />
            )}

            {/* Translucent Area under the temperature curve */}
            <Area
              type="monotone"
              dataKey="temperature"
              stroke={hasSpike ? '#C94A4A' : '#E56B2F'}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#tempGradient)"
              dot={renderCustomDot}
              activeDot={{
                r: 7,
                fill: '#E5A93C',
                stroke: '#FFFFFF',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Visual Timeline Overlay Summary Bar */}
      <div className="bg-[#FAF9F5] dark:bg-[#141414] p-2.5 rounded-md border border-[#DDDCD6] dark:border-[#333333] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-[#4A4A45] dark:text-[#9E9E98]">
          <Radio className="w-3.5 h-3.5 text-[#3F8F6B] animate-pulse" />
          <span>Timeline Visual Overlay:</span>
          <span className="font-semibold text-[#252525] dark:text-[#F5F5F0]">
            {chartData.length} Synchronized Sensor Points
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#4A4A45] dark:text-[#9E9E98]">
            Range:{' '}
            <strong className="text-[#252525] dark:text-[#F5F5F0]">
              {temps.length > 0 ? Math.min(...temps).toFixed(1) : '0.0'}°C
            </strong>{' '}
            to{' '}
            <strong className="text-[#252525] dark:text-[#F5F5F0]">
              {temps.length > 0 ? Math.max(...temps).toFixed(1) : '0.0'}°C
            </strong>
          </span>
          {hasSpike && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#C94A4A]/10 text-[#C94A4A] border border-[#C94A4A]/30 font-bold">
              <ShieldAlert className="w-3 h-3" />
              Spike Excursion Logged
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
