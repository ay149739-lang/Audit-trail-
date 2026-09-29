import { EventStoreService } from '../services/eventStore';
import { ProjectionService } from '../services/projectionService';
import { ShipmentQueryHandler } from '../queries/shipmentQueries';
import { EventType } from '../types';

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

  const processedCount = await ProjectionService.runProjectionBatch();
  assert(processedCount >= 1, 'Projection batch processes newly appended events');

  const checkpointAfter = await ProjectionService.getCheckpoint();
  assert(checkpointAfter.lastProcessedVersion >= 6, 'Checkpoint records last processed version >= 6');

  const rerunCount = await ProjectionService.runProjectionBatch();
  assert(rerunCount === 0, 'Worker resumes from checkpoint and skips already projected events');

  // TEST SUITE 4: HISTORICAL STATE RECONSTRUCTION (PURE DETERMINISTIC FOLDING)
  console.log('\n4. Testing Historical State Reconstruction...');
  const stateAtV1 = await ShipmentQueryHandler.handleGetShipmentStateAt(testId, 1);
  assert(stateAtV1 !== null, 'State at v1 reconstructed');
  assert(stateAtV1?.status === 'CREATED', 'State at v1 has status CREATED');
  assert(stateAtV1?.origin === 'Port of Tokyo, JP', 'State at v1 has origin Port of Tokyo');
  assert(stateAtV1?.events.length === 1, 'State at v1 includes exactly 1 event');

  const stateAtV2 = await ShipmentQueryHandler.handleGetShipmentStateAt(testId, 2);
  assert(stateAtV2?.status === 'IN_TRANSIT', 'State at v2 has status IN_TRANSIT');
  assert(stateAtV2?.currentLocation === 'Pacific Ocean Transit Sector 1', 'State at v2 has currentLocation Sector 1');
  assert(stateAtV2?.events.length === 2, 'State at v2 includes exactly 2 events');

  const stateAtV3 = await ShipmentQueryHandler.handleGetShipmentStateAt(testId, 3);
  assert(stateAtV3?.currentLocation === 'Mid-Pacific Waypoint Alpha', 'State at v3 has currentLocation Mid-Pacific Waypoint Alpha');
  assert(stateAtV3?.events.length === 3, 'State at v3 includes exactly 3 events');

  const stateAtV4 = await ShipmentQueryHandler.handleGetShipmentStateAt(testId, 4);
  assert(stateAtV4?.status === 'WARNING', 'State at v4 has status WARNING');
  assert(stateAtV4?.lastTemperature === 34.5, 'State at v4 has temperature 34.5');
  assert(stateAtV4?.events.length === 4, 'State at v4 includes exactly 4 events');

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

  // REGRESSION TEST 7: INSPECTION_PASSED REDUCER BEHAVIOR & SINGLE SOURCE OF TRUTH
  console.log('\n7. Testing INSPECTION_PASSED & Single Source of Truth Across Services...');
  const inspectId = 'TEST-INSPECT-888';
  await EventStoreService.appendEvent(inspectId, EventType.CONTAINER_CREATED, {
    origin: 'Port of Hamburg',
    destination: 'Port of Felixstowe',
  });
  await EventStoreService.appendEvent(inspectId, EventType.ARRIVED_AT_PORT, {
    location: 'Felixstowe Gate 2',
  });
  const inspectEvent = await EventStoreService.appendEvent(inspectId, EventType.INSPECTION_PASSED, {
    operator: 'Border Security Officer',
    status: 'CUSTOMS_CLEARED',
    notes: 'Container physical scan passed with zero anomalies',
    temperature: 4.2,
  });

  // 1. Through ProjectionService
  await ProjectionService.runProjectionBatch();
  const projReadModel = await ProjectionService.getReadModelShipmentById(inspectId);

  // 2. Through EventStoreService state reconstruction
  const eventStoreProj = await EventStoreService.getShipmentProjection(inspectId);

  // 3. Through ShipmentQueryHandler state-at-version query
  const queryStateAt = await ShipmentQueryHandler.handleGetShipmentStateAt(inspectId, 3);

  assert(projReadModel !== null, 'Read model materialized for inspect aggregate');
  assert(eventStoreProj !== null, 'Event store projected inspect aggregate');
  assert(queryStateAt !== null, 'Historical state reconstructed for inspect aggregate');

  assert(
    projReadModel?.status === 'CUSTOMS_CLEARED',
    'Projection handles INSPECTION_PASSED -> status is CUSTOMS_CLEARED'
  );
  assert(
    eventStoreProj?.status === 'CUSTOMS_CLEARED',
    'EventStore handles INSPECTION_PASSED -> status is CUSTOMS_CLEARED'
  );
  assert(
    queryStateAt?.status === 'CUSTOMS_CLEARED',
    'Historical Query handles INSPECTION_PASSED -> status is CUSTOMS_CLEARED'
  );

  assert(
    projReadModel?.status === eventStoreProj?.status && eventStoreProj?.status === queryStateAt?.status,
    'All three components yield identical status for INSPECTION_PASSED'
  );
  assert(
    projReadModel?.lastTemperature === eventStoreProj?.lastTemperature &&
      eventStoreProj?.lastTemperature === queryStateAt?.lastTemperature,
    'All three components yield identical lastTemperature for INSPECTION_PASSED'
  );
  assert(
    projReadModel?.latestVersion === eventStoreProj?.latestVersion &&
      eventStoreProj?.latestVersion === queryStateAt?.latestVersion,
    'All three components yield identical latestVersion'
  );

  // REGRESSION TEST 8: FIX N+1 QUERY & PAGINATION IN SHIPMENT LISTING
  console.log('\n8. Testing N+1 Fix & Pagination in handleGetAllShipments...');
  const paginatedResult = await ShipmentQueryHandler.handleGetAllShipments(1, 1);
  assert(paginatedResult.shipments.length === 1, 'handleGetAllShipments paginates properly with limit 1');
  assert(paginatedResult.total >= 2, 'Total shipment count is correctly reported');
  assert(paginatedResult.page === 1, 'Page number is 1');
  assert(paginatedResult.limit === 1, 'Limit is 1');

  // Verify that listing does NOT attach bulky event arrays
  const firstShipment = paginatedResult.shipments[0];
  assert(
    (firstShipment as any).events === undefined,
    'handleGetAllShipments does NOT load complete event streams (N+1 query eliminated)'
  );

  console.log('\n====================================================');
  console.log(`WEEK 3 TEST SUMMARY: ${passedTests}/${totalTests} tests passed.`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    console.log('ALL WEEK 3 & REGRESSION REQUIREMENTS VERIFIED SUCCESSFULLY.');
  } else {
    console.error('SOME TESTS FAILED.');
    process.exit(1);
  }
}

runWeek3Tests().catch((err) => {
  console.error('[Test Execution Fatal Error]:', err);
  process.exit(1);
});
