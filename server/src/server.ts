import app from './app';
import { connectDB } from './config/db';
import { runSeed } from './utils/seed';

const PORT = process.env.PORT || 5000;

async function startServer() {
  const isDbConnected = await connectDB();
  
  // Auto-seed initial data so the app has realistic data right away
  try {
    await runSeed();
  } catch (err) {
    console.log('[Bootstrap] Initial seed check complete.');
  }

  app.listen(PORT, () => {
    console.log(`[Server] Audit Trail API listening on http://localhost:${PORT}`);
    console.log(`[CQRS Architecture] Commands: POST /api/shipments, /api/shipments/:id/move, /api/shipments/:id/events`);
    console.log(`[CQRS Architecture] Queries:  GET /api/shipments, /api/shipments/:id, /api/shipments/:id/events`);
    if (!isDbConnected) {
      console.log(`[Store Mode] Running with transient Event Store. Install/start MongoDB locally to persist across server restarts.`);
    }
  });
}

startServer();
