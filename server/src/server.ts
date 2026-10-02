import app from './app';
import { connectDB } from './config/db';
import { seedIfEmpty } from './utils/seed';
import { startProjectionWorker } from './workers/projectionWorker';

const PORT = process.env.PORT || 5000;

async function startServer() {
  const isDbConnected = await connectDB();
  
  // Safe baseline seed: ONLY applies if Event Store is completely empty; never wipes existing data
  try {
    await seedIfEmpty();
  } catch (err) {
    console.log('[Bootstrap] Baseline seed check complete.');
  }

  // Start background Projection Worker process
  try {
    startProjectionWorker();
  } catch (err) {
    console.error('[Bootstrap] Worker initialization error:', err);
  }

  app.listen(PORT, () => {
    console.log(`[Server] Audit Trail API listening on http://localhost:${PORT}`);
    console.log(`[CQRS Architecture] Commands: POST /api/shipments, /api/shipments/:id/move, /api/shipments/:id/events`);
    console.log(`[CQRS Architecture] Queries:  GET /api/shipments, /api/shipments/:id, /api/shipments/:id/events, /api/shipments/:id/state-at`);
    if (!isDbConnected) {
      console.log(`[Store Mode] Running with transient Event Store. Install/start MongoDB locally to persist across server restarts.`);
    }
  });
}

startServer();
