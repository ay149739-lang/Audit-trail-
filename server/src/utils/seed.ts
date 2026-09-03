import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from '../config/db';
import { EventModel } from '../models/Event';
import { EventStoreService } from '../services/eventStore';
import { EventType } from '../types';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedData = [
  {
    aggregateId: 'AT-2048',
    events: [
      {
        eventType: EventType.CONTAINER_CREATED,
        payload: {
          origin: 'Port of Shanghai, CN',
          destination: 'Port of Rotterdam, NL',
          carrier: 'Maersk Line',
          vessel: 'MV Triple-E Explorer',
          operator: 'Li Wei (Shanghai Terminal)',
          containerId: 'MSKU-8849201',
          cargoType: 'Pharmaceutical Refrigerated Goods',
          targetTemp: -18.0,
        },
      },
      {
        eventType: EventType.LOADED_ON_SHIP,
        payload: {
          vessel: 'MV Triple-E Explorer',
          location: 'East Pacific Ocean Waypoint 4',
          operator: 'Captain Aris Thorne',
          grossWeightKg: 24500,
          sealNumber: 'SEAL-SH-9921',
        },
      },
      {
        eventType: EventType.TEMPERATURE_SPIKE,
        payload: {
          location: 'North Indian Ocean (Suez Approach)',
          temperature: -11.4,
          threshold: -15.0,
          durationMinutes: 42,
          sensorId: 'IOT-SENS-77B',
          alertLevel: 'HIGH_WARNING',
          operator: 'Automated Telemetry Sensor',
          notes: 'Refrigeration unit power fluctuation detected during generator transition.',
        },
      },
      {
        eventType: EventType.ARRIVED_AT_PORT,
        payload: {
          location: 'Port of Rotterdam, Quay 4',
          operator: 'Jan van der Meer (Harbor Master)',
          dockTime: '2026-08-28T14:30:00Z',
          customsStatus: 'PENDING_INSPECTION',
        },
      },
      {
        eventType: EventType.CUSTOMS_CLEARED,
        payload: {
          location: 'Rotterdam Customs Facility B',
          operator: 'Customs Officer H. Visser',
          clearanceCode: 'NL-CUST-2026-8812',
          inspectionResult: 'PASSED_WITH_REFRIGERATION_NOTE',
        },
      },
    ],
  },
  {
    aggregateId: 'AT-2049',
    events: [
      {
        eventType: EventType.CONTAINER_CREATED,
        payload: {
          origin: 'Port of Busan, KR',
          destination: 'Port of Long Beach, USA',
          carrier: 'HMM Logistics',
          vessel: 'HMM Algeciras',
          operator: 'Park Ji-hoon',
          containerId: 'HMMU-554109',
          cargoType: 'High-Precision Microconductors',
          targetTemp: 22.0,
        },
      },
      {
        eventType: EventType.LOADED_ON_SHIP,
        payload: {
          vessel: 'HMM Algeciras',
          location: 'North Pacific Shipping Corridor',
          operator: 'Chief Officer Min-jun',
          grossWeightKg: 18200,
          sealNumber: 'SEAL-BS-4410',
        },
      },
      {
        eventType: EventType.MOVED_LOCATION,
        payload: {
          location: 'Mid-Pacific Ocean Waypoint 12',
          vessel: 'HMM Algeciras',
          operator: 'Bridge Officer Kim',
          status: 'IN_TRANSIT',
          speedKnots: 21.5,
          weatherCondition: 'Clear Seas',
        },
      },
      {
        eventType: EventType.ARRIVED_AT_PORT,
        payload: {
          location: 'Port of Long Beach, Terminal Pier T',
          operator: 'Steve Miller (Long Beach Dispatch)',
          dockTime: '2026-09-01T08:15:00Z',
          status: 'AT_PORT',
        },
      },
    ],
  },
  {
    aggregateId: 'AT-2050',
    events: [
      {
        eventType: EventType.CONTAINER_CREATED,
        payload: {
          origin: 'Port of Hamburg, DE',
          destination: 'Port of Singapore, SG',
          carrier: 'Hapag-Lloyd',
          vessel: 'Express Berlin',
          operator: 'Klaus Weber',
          containerId: 'HLXU-109284',
          cargoType: 'Automotive Precision Engine Blocks',
          targetTemp: 20.0,
        },
      },
      {
        eventType: EventType.LOADED_ON_SHIP,
        payload: {
          vessel: 'Express Berlin',
          location: 'English Channel Transit Zone',
          operator: 'Captain Meyer',
          grossWeightKg: 31000,
          sealNumber: 'SEAL-HAM-1092',
        },
      },
      {
        eventType: EventType.TEMPERATURE_SPIKE,
        payload: {
          location: 'Red Sea Transit Corridor',
          temperature: 41.2,
          threshold: 30.0,
          durationMinutes: 95,
          sensorId: 'IOT-TEMP-991',
          alertLevel: 'CRITICAL_HEAT_ALERT',
          operator: 'Telemetry Watchkeeper',
          notes: 'Ambient hold temperature spiked due to desert weather conditions.',
        },
      },
    ],
  },
  {
    aggregateId: 'AT-2051',
    events: [
      {
        eventType: EventType.CONTAINER_CREATED,
        payload: {
          origin: 'Port of Yokohama, JP',
          destination: 'Port of Sydney, AU',
          carrier: 'ONE Ocean Network Express',
          vessel: 'ONE Stork',
          operator: 'Kenji Sato',
          containerId: 'ONEU-990123',
          cargoType: 'Robotic Assembly Components',
          targetTemp: 18.0,
        },
      },
      {
        eventType: EventType.LOADED_ON_SHIP,
        payload: {
          vessel: 'ONE Stork',
          location: 'Philippine Sea Corridor',
          operator: 'Captain Takahashi',
          grossWeightKg: 19800,
          sealNumber: 'SEAL-YOK-7711',
        },
      },
      {
        eventType: EventType.ARRIVED_AT_PORT,
        payload: {
          location: 'Port Botany, Sydney, AU',
          operator: 'Liam O\'Connor',
          dockTime: '2026-08-30T10:00:00Z',
          customsStatus: 'CLEARED',
        },
      },
      {
        eventType: EventType.CUSTOMS_CLEARED,
        payload: {
          location: 'Sydney Logistics Hub 3',
          operator: 'Australian Border Force Officer',
          clearanceCode: 'AU-ABF-2026-9081',
        },
      },
      {
        eventType: EventType.DELIVERED,
        payload: {
          location: 'Sydney Automated Plant 4',
          operator: 'Warehouse Supervisor Dave',
          deliveryTimestamp: '2026-09-02T16:00:00Z',
          recipientSignature: 'D. M. Campbell',
        },
      },
    ],
  },
  {
    aggregateId: 'AT-2052',
    events: [
      {
        eventType: EventType.CONTAINER_CREATED,
        payload: {
          origin: 'Port of Santos, BR',
          destination: 'Port of Antwerp, BE',
          carrier: 'CMA CGM',
          vessel: 'CMA CGM Antoine de Saint Exupery',
          operator: 'Rodrigo Silva',
          containerId: 'CMAU-332901',
          cargoType: 'Organic Arabica Coffee Beans',
          targetTemp: 18.0,
        },
      },
      {
        eventType: EventType.LOADED_ON_SHIP,
        payload: {
          vessel: 'CMA CGM Antoine de Saint Exupery',
          location: 'South Atlantic Ocean',
          operator: 'First Mate Jean-Luc',
          grossWeightKg: 28000,
          sealNumber: 'SEAL-SAN-3301',
        },
      },
    ],
  },
  {
    aggregateId: 'AT-2053',
    events: [
      {
        eventType: EventType.CONTAINER_CREATED,
        payload: {
          origin: 'Port of Jebel Ali, UAE',
          destination: 'Port of Felixstowe, UK',
          carrier: 'MSC Mediterranean Shipping',
          vessel: 'MSC Oscar',
          operator: 'Tariq Al-Mansoor',
          containerId: 'MSCU-771829',
          cargoType: 'Specialty Solar Inverter Systems',
          targetTemp: 25.0,
        },
      },
    ],
  },
];

export async function runSeed() {
  console.log('[Seed] Connecting to MongoDB...');
  const connected = await connectDB();

  if (connected) {
    console.log('[Seed] Purging existing event store data...');
    await EventModel.deleteMany({});
  }

  console.log('[Seed] Inserting seed events for aggregates...');
  for (const ship of seedData) {
    for (const ev of ship.events) {
      await EventStoreService.appendEvent(ship.aggregateId, ev.eventType, ev.payload);
    }
  }

  console.log(`[Seed] Successfully seeded ${seedData.length} shipment aggregates with historical immutable events.`);

  if (connected) {
    process.exit(0);
  }
}

if (require.main === module || process.argv[1]?.includes('seed')) {
  runSeed().catch((err) => {
    console.error('[Seed Error]:', err);
    process.exit(1);
  });
}
