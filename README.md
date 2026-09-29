# 📦 Audit Trail — Event-Sourced Logistics Ledger (MERN Stack)

A production-grade supply-chain audit console demonstrating **Event Sourcing**, **CQRS (Command Query Responsibility Segregation)**, **Read Model Projections**, an asynchronous **Background Node.js Projection Worker**, and deterministic **Historical State Scrubbing**.

---

## 💡 Concept & Week 3 Architecture

In traditional CRUD applications, shipment status is stored as a mutable record (e.g. `status = "IN_TRANSIT"`). Overwriting records loses historical provenance, timeline context, and forensic auditability.

**Audit Trail** never mutates state in the Event Store. State transitions are captured as an immutable, append-only chronological stream of events. A dedicated background projection worker materializes optimized **Read Models**, while pure in-memory folding enables exact temporal rewind to any historical version.

### End-to-End CQRS & Projection Pipeline
```
COMMAND / CQRS WRITE
        ↓
IMMUTABLE EVENT STORE (`events` collection / append-only)
        ↓
BACKGROUND PROJECTION WORKER (`ProjectionWorker.ts` / polls with checkpoints)
        ↓
QUERY-OPTIMIZED READ MODEL (`ShipmentReadModel` collection)
        ↓
QUERY API (`/api/shipments`, `/api/shipments/:id`, `/api/shipments/:id/state-at`)
        ↓
FORENSIC UI CONSOLE (React 18 + Vite + Master-Detail Timeline Rail)
```

---

## ⚙️ Week 3 Core Components

### 1. Read Model Projections (`ShipmentReadModel`)
- Materialized query representations designed for fast listing, filtering, and metric calculation without repeatedly replaying the entire history of every aggregate.
- Fields: `aggregateId`, `origin`, `destination`, `carrier`, `vessel`, `currentLocation`, `status`, `lastTemperature`, `eventCount`, `latestVersion`, `updatedAt`.
- Idempotency guard: If an event version has already been applied, duplicate processing is safely discarded to prevent double-counting or state corruption.

### 2. Background Projection Worker (`projectionWorker.ts`)
- An independent Node.js process polling the Event Store for newly appended events.
- **Progress Tracking & Checkpoint**: Checkpoint state (`ProjectionCheckpoint`) tracks `projectionName`, `lastProcessedVersion`, `lastProcessedEventId`, and `lastProcessedTimestamp`.
- **Worker Recovery & Restart**: On restart, the worker queries only events occurring at or after the persisted checkpoint timestamp, skipping already projected events and resuming execution seamlessly without duplicate work.
- **Fault Tolerance**: If an individual event projection fails, the worker logs the failure and halts the batch before updating the checkpoint, guaranteeing that failing events are never skipped.

### 3. Historical State Scrubbing (`GET /api/shipments/:id/state-at?version=N`)
- Reconstructs the exact state of any shipment aggregate at version `N` or timestamp `T` by fetching the aggregate's immutable event stream and performing a **pure, deterministic fold** over `events[0...N-1]`.
- **Absolute Immutability**:
  - Does NOT mutate the Event Store.
  - Does NOT mutate or corrupt the live Read Model.
  - Does NOT insert or delete events.
  - Historical mode is strictly read-only; write actions are disabled until live state is restored.

---

## 📡 API Contract

| Method | Endpoint | Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shipments` | None | Returns all shipments materialized from the Read Model |
| `GET` | `/api/shipments/:id` | `id` (path) | Returns a single shipment aggregate from the Read Model with full event stream |
| `GET` | `/api/shipments/:id/events` | `id` (path) | Returns chronological immutable event stream for the aggregate |
| `GET` | `/api/shipments/:id/state-at` | `id` (path), `version` (query), `timestamp` (query) | Reconstructs historical state via pure event replay up to version or timestamp |
| `POST` | `/api/shipments` | `aggregateId`, `origin`, `destination`, `carrier`, `vessel` | Dispatches CQRS command to create a new container aggregate (`v1`) |
| `POST` | `/api/shipments/:id/move` | `location`, `vessel`, `operator`, `notes` | Dispatches CQRS command appending a movement event |
| `POST` | `/api/shipments/:id/events` | `eventType`, `payload` | Dispatches arbitrary domain event (e.g. `TEMPERATURE_SPIKE`, `ARRIVED_AT_PORT`) |

---

## 🚀 Running Week 3 Locally

### 1. Install Dependencies
```bash
# In project root
cd server && npm install
cd ../client && npm install
```

### 2. Seed Deterministic Demo Dataset
Seeds 6 shipment aggregates across varied global routes with multi-version lifecycle events:
```bash
cd server
---

## ⚡ Week 4 Core Components & Enhancements

### 1. Optimistic Concurrency Control (OCC)
- **Problem**: Concurrent write operations can overwrite or desynchronize aggregate versions if stale snapshot commands are accepted.
- **Implementation**:
  - Commands transmit `aggregateId` and `expectedVersion`.
  - Backend queries current head version from the Event Store.
  - **Match**: If `expectedVersion === currentVersion`, the command is accepted, appended, and the version increments to `currentVersion + 1`.
  - **Mismatch**: If `expectedVersion !== currentVersion`, the command is rejected with an HTTP `409 CONFLICT` response:
    ```json
    {
      "success": false,
      "error": "Shipment has been modified by another operation. Refresh the shipment and try again.",
      "code": "CONCURRENCY_CONFLICT",
      "expectedVersion": 1,
      "currentVersion": 2,
      "aggregateId": "AT-2048"
    }
    ```
  - **Zero Overwrite Guarantee**: Rejected commands are never written to MongoDB or in-memory storage, preserving append-only immutability.
  - **Conflict UI State**: Professional modal and inline banners displaying submitted vs current versions with a one-click `[Refresh Shipment]` sync action.

### 2. Recharts Sensor Telemetry & Event Timeline Overlay
- Professional cold-chain telemetry curve (`SensorTelemetryChart.tsx`) rendered with Recharts.
- Each event milestone (`CONTAINER_CREATED`, `LOADED_ON_SHIP`, `TEMPERATURE_SPIKE`, `ARRIVED_AT_PORT`, `CUSTOMS_CLEARED`, `DELIVERED`) is visually mapped as an interactive node along the temperature line.
- **Anomaly Detection**: `TEMPERATURE_SPIKE` events display distinct pulsing hazard badges and custom red highlight rings.
- **Reference Threshold Lines**: Safe operating limits (e.g. `-15°C` limit for cold-chain vaccines/pharma) visually overlaid with dashed indicators.
- **Synchronized Forensic Tooltips**: Hovering or clicking points reveals timestamp, temperature, event type, reported location, operator, and shipment ID, and automatically selects the event in the audit inspector.
- **Historical Scrubbing Compatibility**: Event points beyond the scrubber cutoff are dynamically dimmed and dashed.

### 3. Redesigned Enterprise Control Tower & Detail Rail
- Design aesthetic inspired by modern enterprise systems (Linear, Datadog, Grafana, Samsara, Flexport).
- **Operations Dashboard (`OverviewPage.tsx`)**:
  - Live search across shipment ID, ports, vessels, and carriers.
  - Quick status filter tabs (All, Active, In Transit, Delivered, Anomalies).
  - Summary KPI cards calculated purely from real application data.
  - Master-Detail fleet layout with selected shipment preview drawer and global ledger stream.
- **Event Timeline Rail (`EventTimeline.tsx`)**:
  - Domain-specific status icons for each lifecycle milestone.
  - Formatted timestamps (`29 Sep 2026 • 14:32:00`).
  - Clear status pills and contextual short descriptions.
  - Visual immutability header: `AUDIT STORE • APPEND-ONLY • IMMUTABLE EVENTS`.
- **Forensic Event Details Panel (`EventDetailsPanel.tsx`)**:
  - Clean audit-log presentation separating domain parameters, cold-chain sensor telemetry, actor signatures, and collapsible cryptographic JSON with 1-click copy.

---

## 📡 API Contract

| Method | Endpoint | Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shipments` | None | Returns all shipments materialized from the Read Model |
| `GET` | `/api/shipments/:id` | `id` (path) | Returns single shipment aggregate from Read Model with full event stream |
| `GET` | `/api/shipments/:id/events` | `id` (path) | Returns chronological immutable event stream for aggregate |
| `GET` | `/api/shipments/:id/state-at` | `id`, `version`, `timestamp` | Deterministic fold historical state reconstruction |
| `POST` | `/api/shipments` | `aggregateId`, `origin`, `destination`, `expectedVersion?` | Dispatches CreateShipment command (v1) |
| `POST` | `/api/shipments/:id/move` | `location`, `vessel`, `expectedVersion` | Dispatches MoveShipment command with OCC check |
| `POST` | `/api/shipments/:id/events` | `eventType`, `payload`, `expectedVersion` | Dispatches arbitrary domain event with OCC check |

---

