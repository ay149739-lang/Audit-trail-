import { EventStoreService, ConcurrencyError } from '../services/eventStore';
import { ShipmentCommandHandler } from '../commands/shipmentCommands';
import { ProjectionService } from '../services/projectionService';
import { ShipmentQueryHandler } from '../queries/shipmentQueries';
import { EventType } from '../types';
import {
  createShipmentSchema,
  moveShipmentSchema,
  recordEventSchema,
} from '../validation/shipmentValidation';

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

async function runWeek4Tests() {
  console.log('====================================================');
  console.log('AUDIT TRAIL — WEEK 4 AUTOMATED VERIFICATION SUITE');
  console.log('OPTIMISTIC CONCURRENCY CONTROL (OCC) & AUDIT CHECKS');
  console.log('====================================================\n');

  const testId = 'TEST-OCC-7700';

  // TEST 1: Initial creation of shipment aggregate (v1)
  console.log('1. Testing Aggregate Creation & Initial Stream Version...');
  const e1 = await ShipmentCommandHandler.handleCreateShipment({
    aggregateId: testId,
    origin: 'Port of Singapore',
    destination: 'Port of Rotterdam',
    carrier: 'Evergreen Marine',
    vessel: 'Ever Given',
    operator: 'Terminal Master Chen',
  });

  assert(e1 !== null, 'Aggregate created');
  assert(e1.version === 1, 'v1 version established');
  assert(e1.aggregateId === testId, 'AggregateId matches');

  // TEST 2: Valid command with matching expectedVersion === 1
  console.log('\n2. Testing Command Acceptance with Matching expectedVersion (OCC Pass)...');
  const e2 = await ShipmentCommandHandler.handleMoveShipment({
    aggregateId: testId,
    location: 'Strait of Malacca Checkpoint',
    operator: 'Navigator Lee',
    expectedVersion: 1, // User loaded version 1
  });

  assert(e2 !== null, 'Command accepted with expectedVersion === 1');
  assert(e2.version === 2, 'Stream version incremented to 2');

  // TEST 3: Stale command with expectedVersion === 1 (Current is now 2)
  console.log('\n3. Testing Command Rejection with Stale expectedVersion (OCC Conflict)...');
  let conflictCaught = false;
  let caughtError: any = null;

  try {
    // Another client submits a command based on stale version 1
    await ShipmentCommandHandler.handleMoveShipment({
      aggregateId: testId,
      location: 'Concurrent Hacker Path',
      operator: 'Stale Actor',
      expectedVersion: 1, // Stale version! Current version is 2!
    });
  } catch (err: any) {
    conflictCaught = true;
    caughtError = err;
  }

  assert(conflictCaught, 'Stale command was rejected');
  assert(caughtError instanceof ConcurrencyError, 'Error is instance of ConcurrencyError');
  assert(caughtError?.statusCode === 409, 'Error status code is 409 Conflict');
  assert(caughtError?.expectedVersion === 1, 'Error reflects stale expectedVersion: 1');
  assert(caughtError?.currentVersion === 2, 'Error reflects currentVersion: 2');
  assert(
    caughtError?.message.includes('modified by another operation'),
    'Error message matches requirement: "Shipment has been modified by another operation. Refresh the shipment and try again."'
  );

  // TEST 4: Event Store Immutability Check - No Stale Event Overwrite
  console.log('\n4. Testing Event Store Integrity (No Stale Commands Written)...');
  const eventsInStore = await EventStoreService.getEventsForAggregate(testId);
  assert(eventsInStore.length === 2, 'Event store contains exactly 2 valid events');
  assert(eventsInStore[eventsInStore.length - 1].version === 2, 'Latest version in store remains 2');
  const hasStaleEvent = eventsInStore.some((e) => e.payload?.operator === 'Stale Actor');
  assert(!hasStaleEvent, 'Rejected command was NOT written to the Event Store');

  // TEST 5: Client Refresh and Re-dispatch (Simulating UI Refresh Flow)
  console.log('\n5. Testing Client Refresh & Subsequent Command with Head Version (v2)...');
  const e3 = await ShipmentCommandHandler.handleRecordEvent({
    aggregateId: testId,
    eventType: EventType.TEMPERATURE_SPIKE,
    payload: {
      location: 'Indian Ocean Deep Transit',
      temperature: 32.4,
      threshold: 25.0,
      notes: 'Monsoon heat spike detected by sensor',
    },
    operator: 'IoT Telemetry Bridge',
    expectedVersion: 2, // Refreshed version!
  });

  assert(e3 !== null, 'Command with refreshed version accepted');
  assert(e3.version === 3, 'Version incremented to 3');
  assert(e3.payload.temperature === 32.4, 'Sensor temperature recorded');

  // TEST 6: Projection Materialization and Historical Replay on OCC-managed stream
  console.log('\n6. Testing Projection & Historical Scrubbing with OCC Stream...');
  await ProjectionService.projectEvent(e1);
  await ProjectionService.projectEvent(e2);
  await ProjectionService.projectEvent(e3);

  const rm = await ProjectionService.getReadModelShipmentById(testId);
  assert(rm?.latestVersion === 3, 'Read model projected to version 3');
  assert(rm?.status === 'WARNING', 'Read model status projected to WARNING');
  assert(rm?.lastTemperature === 32.4, 'Read model lastTemperature updated');

  // Historical state scrubbing at v2 (before the temperature spike)
  const stateAtV2 = await ShipmentQueryHandler.handleGetShipmentStateAt(testId, 2);
  assert(stateAtV2 !== null, 'State at v2 reconstructed');
  assert(stateAtV2?.status === 'IN_TRANSIT', 'State at v2 was IN_TRANSIT');
  assert(stateAtV2?.currentLocation === 'Strait of Malacca Checkpoint', 'State at v2 location correct');

  // REGRESSION TEST 7: ZOD INPUT VALIDATION ENFORCEMENT
  console.log('\n7. Testing Zod Input Validation & Schema Rules...');

  // 7.1: Invalid empty aggregateId
  const emptyIdResult = createShipmentSchema.safeParse({ aggregateId: '' });
  assert(!emptyIdResult.success, 'Rejects empty aggregateId');

  // 7.2: Invalid aggregateId with spaces/special characters
  const malformedIdResult = createShipmentSchema.safeParse({ aggregateId: 'INVALID ID WITH SPACES!' });
  assert(!malformedIdResult.success, 'Rejects aggregateId with spaces or illegal characters');

  // 7.3: Negative expectedVersion
  const negativeVersionResult = createShipmentSchema.safeParse({
    aggregateId: 'TEST-VAL-01',
    expectedVersion: -1,
  });
  assert(!negativeVersionResult.success, 'Rejects negative expectedVersion (-1)');

  // 7.4: Non-integer expectedVersion (floating point)
  const floatVersionResult = moveShipmentSchema.safeParse({
    location: 'Port of Rotterdam',
    expectedVersion: 2.75,
  });
  assert(!floatVersionResult.success, 'Rejects non-integer expectedVersion (2.75)');

  // 7.5: Arbitrary/illegal eventType
  const illegalEventResult = recordEventSchema.safeParse({
    eventType: 'TOTALLY_FAKE_ARBITRARY_EVENT',
    payload: { status: 'HACKED' },
  });
  assert(!illegalEventResult.success, 'Rejects arbitrary / unrecognized eventType');

  // 7.6: Malformed null/array payload in recordEvent
  const nullPayloadResult = recordEventSchema.safeParse({
    eventType: 'TEMPERATURE_SPIKE',
    payload: null,
  });
  assert(!nullPayloadResult.success, 'Rejects null payload');

  const arrayPayloadResult = recordEventSchema.safeParse({
    eventType: 'TEMPERATURE_SPIKE',
    payload: ['not', 'an', 'object'],
  });
  assert(!arrayPayloadResult.success, 'Rejects array payload when object is expected');

  // 7.7: Valid payloads pass cleanly
  const validCreation = createShipmentSchema.safeParse({
    aggregateId: 'CONT-SAFE-100',
    origin: 'Port of Busan',
    expectedVersion: 0,
  });
  assert(validCreation.success, 'Accepts valid createShipment input');

  const validRecordEvent = recordEventSchema.safeParse({
    eventType: 'INSPECTION_PASSED',
    payload: { inspector: 'Inspector Gadget', passed: true },
    expectedVersion: 4,
  });
  assert(validRecordEvent.success, 'Accepts valid recordEvent input with integer version');

  console.log('\n====================================================');
  console.log(`WEEK 4 TEST SUMMARY: ${passedTests}/${totalTests} tests passed.`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    console.log('ALL WEEK 4 OCC & VALIDATION REQUIREMENTS VERIFIED SUCCESSFULLY.');
  } else {
    console.error('SOME OCC TESTS FAILED.');
    process.exit(1);
  }
}

runWeek4Tests().catch((err) => {
  console.error('[Week 4 Test Fatal Error]:', err);
  process.exit(1);
});
