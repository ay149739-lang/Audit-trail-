import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { ProjectionService } from '../services/projectionService';

dotenv.config();

const POLL_INTERVAL_MS = 1000;

async function startProjectionWorker() {
  console.log('[ProjectionWorker] Starting background Node.js Projection Worker...');
  
  await connectDB();

  console.log(`[ProjectionWorker] Worker active. Polling Event Store every ${POLL_INTERVAL_MS}ms for unprojected events...`);

  let isRunning = false;

  setInterval(async () => {
    if (isRunning) return;
    isRunning = true;

    try {
      const processedCount = await ProjectionService.runProjectionBatch();
      if (processedCount > 0) {
        const checkpoint = await ProjectionService.getCheckpoint();
        console.log(
          `[ProjectionWorker] Processed ${processedCount} event(s). Checkpoint updated to version ${checkpoint.lastProcessedVersion}`
        );
      }
    } catch (err: any) {
      console.error('[ProjectionWorker] Error processing projection batch:', err?.message || err);
    } finally {
      isRunning = false;
    }
  }, POLL_INTERVAL_MS);
}

// Execute worker process if invoked directly
if (require.main === module) {
  startProjectionWorker();
}

export { startProjectionWorker };
