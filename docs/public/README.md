# Table Wars! Event Management System

**Version**: 2.0.0
**Status**: Production-Ready

---

## 📖 Overview
Table Wars! is a high-performance, real-time event management platform designed to orchestrate complex tabletop competitions. Engineered with an event-driven architecture, it provides seamless synchronization between the Host's control dashboard, audience-facing scoreboards, and participant-facing interactive devices.

## 👥 Roles & Perspectives

### The Event Host (Operator)
The **Host Panel** is the nerve center of the application. Designed for speed, it features a low-latency UI, a global keyboard shortcut engine, and real-time projector management.

### The Team Captains (Participants)
Team devices are mobile-first, high-responsive interfaces. Captains can participate in buzzer-in trivia rounds and real-time scoring, with full synchronization via Supabase.

### The Audience (Observers)
The **Live Scoreboard** is an automated visual interface designed for projection, featuring dynamic animations and real-time score updates to maximize crowd engagement.

---

## 🛠️ Infrastructure & Sync Engine
Table Wars! employs a triple-layer synchronization strategy:

1.  **Local State Engine (Zustand)**: An in-memory store that holds the single source of truth for the competition.
2.  **Cross-Tab Sync (BroadcastChannel API)**: Enables multiple tabs on a single device (e.g., Host Panel + Scoreboard on one laptop) to stay synchronized without network latency.
3.  **Cloud Persistence (Supabase Realtime)**: Synchronizes state across disparate physical devices, utilizing Postgres `REALTIME` for sub-second latency across the entire venue.

---

## 🚦 System Requirements

### Host Environment
-   **Hardware**: Laptop/Desktop with a secondary monitor (for projector extension).
-   **Software**: Chrome/Edge browser (latest stable version recommended).
-   **Network**: High-speed, stable local network.

### Participant Devices
-   Any smartphone, tablet, or laptop with a modern browser.
-   *Note*: A mobile hotspot or guest Wi-Fi network is sufficient for low-bandwidth state updates.

---

## 🚀 Deployment & Configuration

### Environment Variables
For secure cloud synchronization, the following variables must be configured in your Vercel project:

| Key | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon/Service role key |

### Scaling for Live Events
*   **Realtime Channels**: Ensure your Supabase plan has sufficient Realtime concurrent connection limits (standard hobby tier handles ~200-500 concurrent connections).
*   **Database Locking**: The system uses the `lock_buzz_for_question` SQL RPC. Ensure your Supabase instance has sufficient compute capacity if running events with 50+ participants.

---

## 📑 Documentation Library

| Guide | Target Audience | Focus |
| :--- | :--- | :--- |
| [**Host Guide**](docs/public/HOST_GUIDE.md) | Event Host | Operation, Setup, Shortcuts |
| [**Technical Overview**](docs/public/TECHNICAL_OVERVIEW.md) | Developers | Architecture, Data Sync, RLS |
| [**API/DB Schema**](supabase/SUPABASE_SCHEMA.sql) | DevOps/DBA | SQL Schema, Security Policies |

---

*Table Wars! is built for high-stakes, real-time competition. If you encounter issues during a live event, refresh the Host Panel to trigger an automatic database re-sync.*
