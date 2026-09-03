# Audit Trail — Antigravity Rebuild Prompt

You are working inside my existing project folder.

The current implementation is not good and I do NOT want you to modify or patch the existing implementation.

## IMPORTANT — START COMPLETELY FRESH

1. Delete the existing project's source code, components, pages, styles, configurations and unnecessary files from the current project folder.
2. Remove the old implementation completely.
3. Do NOT create another nested project folder.
4. Do NOT create a new folder beside the current project.
5. Build the NEW project directly inside the SAME CURRENT FOLDER.
6. Keep only files that are genuinely required for the new project.
7. Reinstall/reconfigure dependencies as required.
8. Make sure the final folder is a clean, runnable project.

Before writing code, inspect the current folder structure and then replace the old implementation completely.

---

# PROJECT

Project Name: **Audit Trail**

Domain: Supply Chain / Logistics

This is an advanced MERN project based on **Event Sourcing + CQRS**.

The goal is NOT to build a basic CRUD inventory application.

The application should feel like a real enterprise logistics/audit platform.

---

# TECHNOLOGY

Use:

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Zustand
- Recharts
- Lucide React
- Modern responsive UI

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose

### Architecture
- CQRS structure
- Event Sourcing structure
- Service layer
- Controllers
- Routes
- Models
- Validation
- Proper error handling

Keep frontend and backend properly separated within the SAME project folder.

---

# DEVELOPMENT SCOPE

Implement ONLY **WEEK 1 AND WEEK 2** of the project.

Do NOT jump to Week 3 or Week 4 features.

The project document defines Week 1 as CQRS setup + dashboard scaffolding and Week 2 as Event Store + timeline UI. Follow that scope exactly.

---

# WEEK 1 — BACKEND

Implement CQRS architecture.

Create separate command and query responsibilities.

Example:

Commands:
- POST /api/shipments
- POST /api/shipments/:id/move
- POST /api/shipments/:id/events

Queries:
- GET /api/shipments
- GET /api/shipments/:id
- GET /api/shipments/:id/events

Create a clean backend structure similar to:

backend/
  src/
    commands/
    queries/
    controllers/
    services/
    routes/
    models/
    middleware/
    utils/
    config/
    app.ts
    server.ts

Do not put everything into one giant server.js/server.ts file.

---

# WEEK 1 — FRONTEND

Create the main Audit Trail dashboard.

The dashboard must include:

- Sidebar navigation
- Top navigation/header
- Search shipment ID
- Overview/dashboard section
- Shipment list
- Shipment status
- Current location
- Event count
- Recent activity
- Clean enterprise-style cards
- Responsive layout
- Loading states
- Empty states
- Error states

Navigation should include:

- Overview
- Shipments
- Timeline
- Analytics
- Settings

The UI must NOT look like a basic student CRUD project.

It should look like a modern enterprise SaaS logistics platform.

---

# WEEK 2 — EVENT STORE

Implement the Event Store using MongoDB.

Create an append-only event collection.

Each event should contain fields such as:

- aggregateId
- eventType
- payload
- timestamp
- version

Example events:

CONTAINER_CREATED
LOADED_ON_SHIP
TEMPERATURE_SPIKE
ARRIVED_AT_PORT

IMPORTANT:

The Event Store is APPEND-ONLY.

Do NOT implement UPDATE or DELETE operations for events.

The architecture should make it clear that historical events are immutable.

---

# WEEK 2 — EVENT TIMELINE UI

Create a shipment detail page with a beautiful chronological event timeline.

Example:

Shipment #AT-2048

● Container Created
│
● Loaded on Ship
│
● Temperature Spike
│
● Arrived at Port

Each event should display:

- Event type
- Date/time
- Location if available
- Event metadata
- Version
- Event payload/details

Clicking an event should open a detail panel/modal showing the complete event payload.

Use realistic mock/seed data so the UI looks complete when the application starts.

---

# SEARCH

Implement shipment ID search.

User should be able to search something like:

AT-2048

and see the corresponding shipment details and event timeline.

Do not make the search purely decorative.

Connect it to the backend API.

---

# UI / UX REQUIREMENTS

Make the interface polished.

Use:

- Proper spacing
- Consistent typography
- Professional dashboard hierarchy
- Responsive sidebar
- Responsive tables
- Cards
- Timeline visualization
- Hover states
- Focus states
- Smooth transitions
- Skeleton loading
- Toast/error feedback where appropriate
- Empty states
- Confirmation states where required

Avoid:

- Huge unnecessary gradients
- Random colors
- Excessive animations
- Generic template-looking UI
- Oversized text
- Cluttered cards
- Unnecessary glassmorphism
- Fake functionality

Use a restrained enterprise SaaS visual language.

---

# DATA

Create realistic seed data for multiple shipments.

For example:

AT-2048
AT-2049
AT-2050

Each shipment should have multiple historical events.

Include realistic event payloads such as:

- container information
- location
- vessel
- temperature
- timestamps
- status

Do not use meaningless lorem ipsum data.

---

# API + FRONTEND CONNECTION

The frontend must actually communicate with the backend.

Do NOT build a static frontend with hardcoded data only.

Create a clean API/service layer on the frontend.

Handle:

- loading
- success
- empty
- error

states properly.

---

# CODE QUALITY

Write production-style code.

Requirements:

- TypeScript
- Reusable components
- Reusable hooks where useful
- Proper types/interfaces
- Clean naming
- No duplicated components
- No giant components
- No unnecessary dependencies
- Environment variables for configuration
- Proper error handling
- Clean folder structure

Do not leave random unused files.

Do not leave broken imports.

Do not leave TODO placeholders for functionality that is supposed to be completed in Week 1–2.

---

# IMPORTANT — DO NOT IMPLEMENT YET

Do NOT implement these Week 3/4 features:

- Read model projections
- Background projection worker
- Time rewind slider
- Historical state scrubbing
- Optimistic concurrency control
- Sensor charts
- JWT authentication
- Replay feature

Those belong to later phases.

Only prepare the architecture so these features can be added later without rewriting the application.

---

# FINAL VERIFICATION

After implementation:

1. Install all required dependencies.
2. Run the frontend.
3. Run the backend.
4. Verify there are no build errors.
5. Verify there are no TypeScript errors.
6. Verify API routes work.
7. Verify MongoDB connection configuration.
8. Verify shipment search works.
9. Verify event timeline loads from backend data.
10. Verify event details work.
11. Verify responsive layout.
12. Remove unused/broken code.
13. Make sure the project can be started easily from the SAME CURRENT FOLDER.

At the end, provide a concise summary of:

- What was deleted
- What was rebuilt
- Folder structure
- Technologies used
- Week 1 features completed
- Week 2 features completed
- Commands to run frontend/backend
- Any environment variables required

MOST IMPORTANT:

Do not modify the old project into something slightly better.

**DELETE THE OLD IMPLEMENTATION AND BUILD AUDIT TRAIL CLEANLY FROM SCRATCH IN THE SAME CURRENT FOLDER, COMPLETING ONLY WEEK 1 AND WEEK 2.**
