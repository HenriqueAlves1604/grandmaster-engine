# Grandmaster Engine

A high-performance Chess Engine backend built with Node.js, TypeScript, and Domain-Driven Design (DDD).

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Web Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL 8.0 & Redis
- **Architecture:** Hexagonal / Modular Monolith
- **Testing:** Vitest
- **Containerization:** Docker & Docker Compose

## Getting Started

### Prerequisites

- Node.js (Latest LTS)
- [pnpm](https://pnpm.io/installation)
- Docker & Docker Compose

### Installation & Setup

```bash
# Clone the repository

# Enter the directory
cd grandmaster-engine

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Start infrastructure (MySQL & Redis)
pnpm db:up

# Run the application in development mode
pnpm dev
```

## Development & Testing

Use the following scripts to manage the application lifecycle:

```bash
# Run application in development mode (watch mode)
pnpm dev

# Execute all unit tests
pnpm test

# Run tests in watch mode for TDD
pnpm test:watch

# Generate code coverage report
pnpm test:coverage

# Run linter to check code quality
pnpm lint

# Format code according to style guides
pnpm format
```

## Architecture & Database Design

The project is built following **Domain-Driven Design (DDD)** and **Hexagonal Architecture** principles within a **Modular Monolith** structure. The primary database is **MySQL 8.0**, featuring an advanced normalized schema designed for high performance and scalability.



### Bounded Contexts (Modules)

- **`src/modules/identity` (Identity & Player Profile)**
  - Manages secure user authentication (`players` table with UUID v4 and hashed passwords).
  - Handles the `player_stats` aggregate (1:1 relation), tracking current ELO, highest ELO, and match history. Separating stats from authentication ensures faster leaderboard queries and matchmaking logic.

- **`src/modules/gameplay` (Core Gameplay & Game Rules)**
  - The heart of the engine. Manages the `matches` entity (states: WAITING, ONGOING, FINISHED) and records individual `moves` with precise timestamps and FEN state snapshots.
  - Utilizes a unified `time_controls` lookup table (e.g., Blitz 3+2, Bullet 1+0) to centralize game rules across both casual matches and tournaments.

- **`src/modules/tournaments` (Tournament Management)**
  - Controls the lifecycle of events (UPCOMING, ONGOING, FINISHED) via the `tournaments` entity.
  - Manages player enrollment and dynamic leaderboards through the `tournament_participants` table.

- **`src/modules/matchmaking` (Real-Time Pairing)**
  - A logical module that utilizes Redis and the indexed `current_elo` from the Identity module to pair players efficiently based on skill level and selected time controls.

- **`src/shared` (Cross-Cutting Concerns)**
  - Contains environment validation (Zod), base classes, and infrastructure utilities.