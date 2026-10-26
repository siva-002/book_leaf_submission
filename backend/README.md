# BookLeaf Support Backend

The backend API and real-time messaging server for the BookLeaf Author Support Portal. Built with Node.js, Express, TypeScript, PostgreSQL (Sequelize), Socket.IO, and AI ticket classification.

---

## 1. Simple Architecture

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                      Client Applications                    │
 │               (Author Studio & Admin Portal)                │
 └──────────────────────────────┬──────────────────────────────┘
                                │
               HTTP Requests    │    WebSockets (ws://)
               (REST API)       │    (Real-time updates)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                       Express Server                        │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │ Middleware: CORS, Auth (JWT), File Upload (Multer)     │  │
 │  └───────────────────────────┬───────────────────────────┘  │
 │                              ▼                              │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │ Routes & Controllers:                                 │  │
 │  │ • Auth (Login, Current User, Demo Accounts)           │  │
 │  │ • Author (Submit Tickets, View Books, Chat)           │  │
 │  │ • Admin (Queue, Update Status/Priority, Notes)        │  │
 │  └───────────────────────────┬───────────────────────────┘  │
 │                              │                              │
 │            ┌─────────────────┴─────────────────┐            │
 │            ▼                                   ▼            │
 │  ┌─────────────────────────┐       ┌──────────────────────┐ │
 │  │   AI Engine Service     │       │ Socket.IO Handler    │ │
 │  │ • Auto category & level │       │ • Instant messages   │ │
 │  │ • Smart draft responses │       │ • Live status change │ │
 │  │ • Safe rule fallback    │       │ • Typing alerts      │ │
 │  └─────────────────────────┘       └──────────────────────┘ │
 └──────────────────────────────┬──────────────────────────────┘
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                  PostgreSQL Database                        │
 │    Users  •  Books  •  Tickets  •  Ticket Messages          │
 └─────────────────────────────────────────────────────────────┘
```

### Folder Structure
- **`src/server.ts`**: Entry point. Sets up Express, HTTP server, WebSockets, and database.
- **`src/config/`**: App settings (`config.ts`) and PostgreSQL connection (`database.ts`).
- **`src/models/`**: Database models (`User`, `Book`, `Ticket`, `TicketMessage`).
- **`src/routes/`**: API route definitions (`authRoutes`, `authorRoutes`, `adminRoutes`, `uploadRoutes`).
- **`src/controllers/`**: Request handlers and main business logic.
- **`src/middleware/`**: JWT validation, error handling, and file upload parsing.
- **`src/services/aiService.ts`**: AI classification and automated reply drafts using OpenRouter/OpenAI with rule fallback.
- **`src/services/seedService.ts`**: Sets up default admin and sample author accounts.
- **`src/socket/socketHandler.ts`**: Manages real-time Socket.IO rooms and live ticket events.

---

## 2. Required Environment Variables

Create a `.env` file in the `backend/` folder:

```bash
cp .env.example .env
```

| Variable | Description | Example Default |
| :--- | :--- | :--- |
| `PORT` | Port the server listens on | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | Secret key for signing login tokens | `any_secure_random_string` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | PostgreSQL database name | `bookleaf` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DATABASE_URL` | *(Optional)* Full connection string | `postgres://user:pass@host:5432/dbname` |
| `OPENROUTER_API_KEY` | OpenRouter API Key for AI features | `sk-or-v1-...` *(or leave blank for rule fallback)* |
| `OPENROUTER_MODEL` | AI model to use | `openrouter/free` |

> **Note**: If `OPENROUTER_API_KEY` is not set or rate-limited, the system automatically uses a smart keyword-based rule fallback so tickets always get classified.

---

## 3. How to Start the App

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) running locally or in the cloud

### Steps

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Setup your environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The server starts on `http://localhost:5000`. On first run, it automatically connects to PostgreSQL, creates all tables, and seeds demo accounts.

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

5. **API Documentation:**
   Open `http://localhost:5000/api` in your browser to view all available REST endpoints.
