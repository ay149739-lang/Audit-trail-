# 📦 Audit Trail — Event-Sourced Logistics Ledger (MERN Stack)

A high-performance supply-chain audit dashboard demonstrating **Event Sourcing** and **Command Query Responsibility Segregation (CQRS)** instead of traditional CRUD state mutation.

---

## 💡 Concept & Architecture

In traditional CRUD applications, shipment status is stored as a mutable record (e.g. `status = "IN_TRANSIT"`). Overwriting records loses historical provenance, timeline context, and forensic verifiability.

**Audit Trail** never stores current state directly in the database. Instead:
1. Every change is stored as an **immutable, append-only event** in MongoDB.
2. Current shipment state is calculated on demand by **replaying ("folding")** all events for an `aggregateId` in chronological order (`v1 → vN`).

### Event Stream Example
```
[CONTAINER_CREATED] → [LOADED_ON_SHIP] → [TEMPERATURE_SPIKE] → [ARRIVED_AT_PORT] → [CUSTOMS_CLEARED]
```

### Architecture Diagram (CQRS Pattern)
```
 +-----------------------------------------------------------------------+
 |                              FRONTEND                                 |
 |                     (React 18 + Vite + Tailwind)                      |
 +-----------------------------------+-----------------------------------+
                                     |
               Command Path (Write)  |  Query Path (Read)
               [POST /create, /move] |  [GET /:id, /:id/events, /recent]
                                     v
 +-----------------------------------------------------------------------+
 |                               EXPRESS                                 |
 |                                                                       |
 |   COMMAND SERVICE                         QUERY SERVICE               |
 |   - Validate command                      - Fetch ordered event stream|
 |   - Get max(version) + 1                  - Execute Replay Engine     |
 |   - Append immutable event                - Return computed state     |
 +-----------------------------------+-----------------------------------+
                                     |
                                     v
 +-----------------------------------------------------------------------+
 |                               MONGODB                                 |
 |                 Collection: `events` (Append Only)                    |
 |          Compound Index: { aggregateId: 1, version: 1 }               |
 +-----------------------------------------------------------------------+
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS 3, Zustand, Axios, Lucide React, Recharts
- **Backend**: Node.js 20+, Express.js, Mongoose (MongoDB ODM), dotenv, cors
- **Database**: MongoDB (`events` collection) with automatic `mongodb-memory-server` fallback for zero-config local runs

---

## 📁 Directory Structure

```
audit-trail/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── ThemeToggle.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── RecentShipments.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   └── StateSummaryCard.jsx
│   │   │   └── timeline/
│   │   │       ├── EventTimeline.jsx
│   │   │       ├── TimelineNode.jsx
│   │   │       └── TimelineSkeleton.jsx
│   │   ├── store/
│   │   │   └── useShipmentStore.js       (Zustand store)
│   │   ├── lib/
│   │   │   ├── api.js                    (Axios instance & API callers)
│   │   │   └── eventIcons.js             (eventType -> Lucide icon mapping)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── models/
│   │   │   └── Event.js                  (Mongoose schema)
│   │   ├── routes/
│   │   │   ├── commandRoutes.js
│   │   │   └── queryRoutes.js
│   │   ├── services/
│   │   │   ├── commandService.js
│   │   │   └── queryService.js
│   │   ├── utils/
│   │   │   └── replayEvents.js           (Pure fold/replay logic)
│   │   ├── seed/
│   │   │   └── seedEvents.js             (Sample data loader)
│   │   ├── config/
│   │   │   └── db.js                     (MongoDB connector)
│   │   └── app.js
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Quickstart & Installation

### 1. Install Server Dependencies
```bash
cd server
npm install
```

### 2. Seed Sample Database
Populates `SHIP-1001` and `SHIP-1002` event streams:
```bash
npm run seed
```

### 3. Start Backend Server
```bash
npm run dev
# Server starts at http://localhost:5000
```

### 4. Install & Start Frontend (New Terminal Window)
```bash
cd client
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

---

## 📡 API Contract

### Command Routes (Write Operations)

#### `POST /api/shipment/create`
Creates version 1 `CONTAINER_CREATED` event.
```json
// Request Body
{
  "aggregateId": "SHIP-1003",
  "payload": {
    "origin": "Port of Tokyo, JP",
    "destination": "Port of Vancouver, CA",
    "carrier": "NYK Line",
    "cargoDescription": "Automotive Sensor Arrays",
    "maxTempThreshold": 20
  }
}
```

#### `POST /api/shipment/move`
Appends next event with `version = lastVersion + 1`.
```json
// Request Body
{
  "aggregateId": "SHIP-1001",
  "eventType": "TEMPERATURE_SPIKE",
  "payload": {
    "currentTemp": 29.5,
    "threshold": 22,
    "sensorId": "REEFER-SENS-09",
    "severity": "CRITICAL"
  }
}
```

---

### Query Routes (Read Operations)

#### `GET /api/shipment/:id/events`
Returns raw ordered array of all events for an aggregateId.
```json
[
  {
    "_id": "...",
    "aggregateId": "SHIP-1001",
    "eventType": "CONTAINER_CREATED",
    "payload": { ... },
    "version": 1,
    "timestamp": "2026-08-20T08:00:00.000Z"
  },
  {
    "_id": "...",
    "aggregateId": "SHIP-1001",
    "eventType": "LOADED_ON_SHIP",
    "payload": { ... },
    "version": 2,
    "timestamp": "2026-08-21T14:30:00.000Z"
  }
]
```

#### `GET /api/shipment/:id`
Returns computed current state via replay/fold:
```json
{
  "aggregateId": "SHIP-1001",
  "currentState": {
    "aggregateId": "SHIP-1001",
    "status": "CUSTOMS_CLEARED",
    "location": "Port of Long Beach",
    "carrier": "Pacific Ocean Logistics",
    "hasActiveAlert": true,
    "temperatureAlerts": [ ... ]
  },
  "lastUpdated": "2026-08-27T09:00:00.000Z",
  "eventCount": 5
}
```

#### `GET /api/shipments/recent`
Returns top 5 distinct shipment IDs with latest timestamp:
```json
[
  {
    "aggregateId": "SHIP-1001",
    "latestEvent": "CUSTOMS_CLEARED",
    "lastUpdated": "2026-08-27T09:00:00.000Z",
    "eventCount": 5
  }
]
```
