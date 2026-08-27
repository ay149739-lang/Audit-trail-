require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');
const connectDB = require('../config/db');

const seedData = [
  // SHIP-1001 stream
  {
    aggregateId: 'SHIP-1001',
    eventType: 'CONTAINER_CREATED',
    version: 1,
    payload: {
      origin: 'Port of Shanghai, CN',
      destination: 'Port of Long Beach, USA',
      carrier: 'Pacific Ocean Logistics',
      cargoDescription: 'Precision Semiconductor Microchips',
      maxTempThreshold: 22,
      shipper: 'Global Tech Components Ltd.'
    },
    timestamp: new Date('2026-08-20T08:00:00.000Z')
  },
  {
    aggregateId: 'SHIP-1001',
    eventType: 'LOADED_ON_SHIP',
    version: 2,
    payload: {
      vesselName: 'M/V Pacific Titan',
      port: 'Port of Shanghai',
      seaRoute: 'Trans-Pacific Route 4',
      containerBay: 'B-14-02'
    },
    timestamp: new Date('2026-08-21T14:30:00.000Z')
  },
  {
    aggregateId: 'SHIP-1001',
    eventType: 'TEMPERATURE_SPIKE',
    version: 3,
    payload: {
      currentTemp: 28.5,
      threshold: 22,
      sensorId: 'REEFER-SENS-09',
      unit: '°C',
      severity: 'HIGH',
      notes: 'Reefer power supply fluctuation during maritime storm.'
    },
    timestamp: new Date('2026-08-23T11:15:00.000Z')
  },
  {
    aggregateId: 'SHIP-1001',
    eventType: 'ARRIVED_AT_PORT',
    version: 4,
    payload: {
      port: 'Port of Long Beach',
      terminal: 'Pier T Container Terminal',
      berth: 'T-102',
      dischargeTime: '2026-08-26T05:10:00Z'
    },
    timestamp: new Date('2026-08-26T04:45:00.000Z')
  },
  {
    aggregateId: 'SHIP-1001',
    eventType: 'CUSTOMS_CLEARED',
    version: 5,
    payload: {
      customOffice: 'US Customs & Border Protection',
      clearanceId: 'CLR-US-991823',
      status: 'APPROVED',
      dutyPaidUSD: 14250.00,
      inspectedBy: 'Officer J. Miller'
    },
    timestamp: new Date('2026-08-27T09:00:00.000Z')
  },

  // SHIP-1002 stream
  {
    aggregateId: 'SHIP-1002',
    eventType: 'CONTAINER_CREATED',
    version: 1,
    payload: {
      origin: 'Port of Rotterdam, NL',
      destination: 'Port of Singapore, SG',
      carrier: 'Maersk Line',
      cargoDescription: 'Cold-chain Pharmaceutical Vaccines',
      maxTempThreshold: 8,
      shipper: 'EuroPharma Biologics NV'
    },
    timestamp: new Date('2026-08-22T06:00:00.000Z')
  },
  {
    aggregateId: 'SHIP-1002',
    eventType: 'LOADED_ON_SHIP',
    version: 2,
    payload: {
      vesselName: 'Maersk Mc-Kinney Moller',
      port: 'Port of Rotterdam',
      seaRoute: 'Suez Maritime Corridor',
      containerBay: 'A-04-11'
    },
    timestamp: new Date('2026-08-23T18:00:00.000Z')
  },
  {
    aggregateId: 'SHIP-1002',
    eventType: 'TEMPERATURE_SPIKE',
    version: 3,
    payload: {
      currentTemp: 12.4,
      threshold: 8,
      sensorId: 'BIO-TEMP-44',
      unit: '°C',
      severity: 'CRITICAL',
      notes: 'Cooling system secondary valve bypass triggered.'
    },
    timestamp: new Date('2026-08-25T13:20:00.000Z')
  },
  {
    aggregateId: 'SHIP-1002',
    eventType: 'ARRIVED_AT_PORT',
    version: 4,
    payload: {
      port: 'Port of Singapore',
      terminal: 'Pasir Panjang Terminal',
      berth: 'PPT-08',
      dischargeTime: '2026-08-27T13:00:00Z'
    },
    timestamp: new Date('2026-08-27T12:30:00.000Z')
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing events collection...');
    await Event.deleteMany({});
    
    console.log(`[Seed] Inserting ${seedData.length} sample events for SHIP-1001 & SHIP-1002...`);
    await Event.insertMany(seedData);
    
    console.log('✅ [Seed] Database successfully seeded!');
    process.exit(0);
  } catch (err) {
    console.error('❌ [Seed] Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
