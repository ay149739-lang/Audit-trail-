import { EventStoreService } from '../services/eventStore';
import { ProjectionService } from '../services/projectionService';
import { ShipmentQueryHandler } from '../queries/shipmentQueries';
import { EventType, IEvent } from '../types';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (detail) console.error(`    Detail: ${detail}`);
    process.exitCode = 1;
  }
}

async function runWeek3Tests() {
  console.log('====================================================');
  console.log('AUDIT TRAIL — WEEK 3 AUTOMATED VERIFICATION SUITE');
  console.log('====================================================\n');

  // TEST SUITE 1: PROJECTION LOGIC & READ MODEL UPDATE BEHAVIOR
  console.log('1. Testing Projection Logic & Read Model Materialization...');
  const testId = 'TEST-WK3-999';

  // Clear in-memory / test state
  await ProjectionService.rebuildAllReadModels();

  // v1: Container Created
  const e1 = await EventStoreService.appendEvent(testId, EventType.CONTAINER_CREATED, {
    origin: 'Port of Tokyo, JP',
    destination: 'Port of Los Angeles, USA',
    carrier: 'Pacific Freight Lines',
    vessel: 'MV Pacific Wave',
  });
  await ProjectionService.projectEvent(e1);

  let rm = await ProjectionService.getReadModelShipmentById(testId);
  assert(rm !== null, 'Read Model created for new aggregate');
  assert(rm?.status === 'CREATED', 'v1 produces status CREATED');
  assert(rm?.origin === 'Port of Tokyo, JP', 'v1 sets origin correctly');
  assert(rm?.latestVersion === 1, 'v1 sets latestVersion to 1');
  assert(rm?.eventCount === 1, 'v1 sets eventCount to 1');

  // v2: Loaded on ship
  const e2 = await EventStoreService.appendEvent(testId, EventType.LOADED_ON_SHIP, {
    location: 'Pacific Ocean Transit Sector 1',
    vessel: 'MV Pacific Wave',
  });
  await ProjectionService.projectEvent(e2);

  rm = await ProjectionService.getReadModelShipmentById(testId);
  assert(rm?.status === 'IN_TRANSIT', 'v2 produces status IN_TRANSIT');
  assert(rm?.currentLocation === 'Pacific Ocean Transit Sector 1', 'v2 updates currentLocation');
  assert(rm?.latestVersion === 2, 'v2 updates latestVersion to 2');
  assert(rm?.eventCount === 2, 'v2 updates eventCount to 2');

  // v3: Moved Location
  const e3 = await EventStoreService.appendEvent(testId, EventType.MOVED_LOCATION, {
    location: 'Mid-Pacific Waypoint Alpha',
  });
  await ProjectionService.projectEvent(e3);

  rm = await ProjectionService.getReadModelShipmentById(testId);
  assert(rm?.currentLocation === 'Mid-Pacific Waypoint Alpha', 'v3 updates currentLocation to midpoint');

  // v4: Temperature Spike
  const e4 = await EventStoreService.appendEvent(testId, EventType.TEMPERATURE_SPIKE, {
    temperature: 34.5,
    notes: 'Refrigeration unit malfunction',
  });
  await ProjectionService.projectEvent(e4);

  rm = await ProjectionService.getReadModelShipmentById(testId);
  assert(rm?.status === 'WARNING', 'v4 sets status to WARNING');
  assert(rm?.lastTemperature === 34.5, 'v4 records lastTemperature correctly');

  // v5: Arrived At Port
  const e5 = await EventStoreService.appendEvent(testId, EventType.ARRIVED_AT_PORT, {
    location: 'Port of Los Angeles, Pier 400',
  });
  await ProjectionService.projectEvent(e5);

  rm = await ProjectionService.getReadModelShipmentById(testId);
  assert(rm?.status === 'AT_PORT', 'v5 sets status to AT_PORT');
  assert(rm?.currentLocation === 'Port of Los Angeles, Pier 400', 'v5 updates currentLocation to destination port');
  assert(rm?.latestVersion === 5, 'v5 sets latestVersion to 5');
  assert(rm?.eventCount === 5, 'v5 sets eventCount to 5');

  // TEST SUITE 2: IDEMPOTENCY & DUPLICATE EVENT HANDLING
  console.log('\n2. Testing Idempotency (Duplicate Event Re-Processing)...');
  // Re-project e2 (version 2) on a read model that is already at version 5
  await ProjectionService.projectEvent(e2);
  rm = await ProjectionService.getReadModelShipmentById(testId);
  assert(rm?.eventCount === 5, 'Duplicate event processing does not increment eventCount');
  assert(rm?.latestVersion === 5, 'Duplicate event processing does not corrupt latestVersion');
  assert(rm?.status === 'AT_PORT', 'Duplicate older event does not roll back newer status');

  // TEST SUITE 3: PROJECTION CHECKPOINT & RECOVERY
  console.log('\n3. Testing Projection Checkpoint & Recovery...');
  const checkpointBefore = await ProjectionService.getCheckpoint();
  assert(checkpointBefore !== null, 'Checkpoint exists');

  // Append new event to test batch projection & checkpoint update
  await EventStoreService.appendEvent(testId, EventType.DELIVERED, {
    location: 'Port of Los Angeles, Consignee Facility',
  });

  // Run projection batch
  const processedCount = await ProjectionService.runProjectionBatch();
  assert(processedCount >= 1, 'Projection batch processes newly appended events');

  const checkpointAfter = await ProjectionService.getCheckpoint();
  assert(checkpointAfter.lastProcessedVersion >= 6, 'Checkpoint records last processed version >= 6');

  // Simulate worker restart (running batch again should process 0 new events)
  const rerunCount = await ProjectionService.runProjectionBatch();
  assert(rerunCount === 0, 'Worker resumes from checkpoint and skips already projected events');

  // TEST SUITE 4: HISTORICAL STATE RECONSTRUCTION (PURE DETERMINISTIC FOLDING)
  console.log('\n4. Testing Historical State Reconstruction...');

  // State at v1: Should be CREATED at Tokyo
  const stateAtV1 = await ShipmentQueryHandler.handleGetShipmentStateAt(testId, 1);
  assert(stateAtV1 !== null, 'State at v1 reconstructed');
  assert(stateAtV1?.status === 'CREATED', 'State at v1 has status CREATED');
  assert(stateAtV1?.origin === 'Port of Tokyo, JP', 'State at v1 has origin Port of Tokyo');
  assert(stateAtV1?.events.length === 1, 'State at v1 includes exactly 1 event');

  // State at v2: Should be IN_TRANSIT at Sector 1
  const stateAtV2 = await ShipmentQueryHandler.handleGetShipmentStateAt(testId, 2);
  assert(stateAtV2?.status === 'IN_TRANSIT', 'State at v2 has status IN_TRANSIT');
  assert(stateAtV2?.currentLocation === 'Pacific Ocean Transit Sector 1', 'State at v2 has currentLocation Sector 1');
  assert(stateAtV2?.events.length === 2, 'State at v2 includes exactly 2 events');

  // State at v3: Should be IN_TRANSIT at Waypoint Alpha
  const stateAtV3 = await ShipmentQueryHandler.handleGetShipmentStateAt(testId, 3);
  assert(stateAtV3?.currentLocation === 'Mid-Pacific Waypoint Alpha', 'State at v3 has currentLocation Mid-Pacific Waypoint Alpha');
  assert(stateAtV3?.events.length === 3, 'State at v3 includes exactly 3 events');

  // State at v4: Should be WARNING with temperature 34.5
  const stateAtV4 = await ShipmentQueryHandler.handleGetShipmentStateAt(testId, 4);
  assert(stateAtV4?.status === 'WARNING', 'State at v4 has status WARNING');
  assert(stateAtV4?.lastTemperature === 34.5, 'State at v4 has temperature 34.5');
  assert(stateAtV4?.events.length === 4, 'State at v4 includes exactly 4 events');

  // State at v5: Should be AT_PORT at Los Angeles
  const stateAtV5 = await ShipmentQueryHandler.handleGetShipmentStateAt(testId, 5);
  assert(stateAtV5?.status === 'AT_PORT', 'State at v5 has status AT_PORT');
  assert(stateAtV5?.currentLocation === 'Port of Los Angeles, Pier 400', 'State at v5 has currentLocation Port of Los Angeles');
  assert(stateAtV5?.events.length === 5, 'State at v5 includes exactly 5 events');

  // TEST SUITE 5: EVENT STORE IMMUTABILITY DURING HISTORICAL SCRUBBING
  console.log('\n5. Testing Event Store Immutability During Historical Scrubbing...');
  const eventsInStore = await EventStoreService.getEventsForAggregate(testId);
  assert(eventsInStore.length === 6, 'Event Store contains exactly 6 immutable events');

  const currentLiveRm = await ProjectionService.getReadModelShipmentById(testId);
  assert(currentLiveRm?.latestVersion === 6, 'Live Read Model version remains 6 after scrubbing');
  assert(currentLiveRm?.status === 'DELIVERED', 'Live Read Model status remains DELIVERED after scrubbing');

  // TEST SUITE 6: ERROR HANDLING & EDGE CASES
  console.log('\n6. Testing Error Handling & Edge Cases...');
  const nonExistent = await ShipmentQueryHandler.handleGetShipmentStateAt('NON-EXISTENT-AGGREGATE', 1);
  assert(nonExistent === null, 'Querying non-existent aggregate returns null safely');

  const invalidVersion = await ShipmentQueryHandler.handleGetShipmentStateAt(testId, 0);
  assert(invalidVersion === null, 'Querying version 0 returns null safely');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} tests passed.`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    console.log('ALL WEEK 3 REQUIREMENTS VERIFIED SUCCESSFULLY.');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED.');
    process.exit(1);
  }
}

runWeek3Tests().catch((err) => {
  console.error('[Test Execution Fatal Error]:', err);
  process.exit(1);
});
