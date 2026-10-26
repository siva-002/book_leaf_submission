# BookLeaf Support Frontend

The web application for the BookLeaf Author Support Portal. Built with React 19, TypeScript, Vite, and Lucide Icons.

---

## 1. Features
- **Author Studio**: View published books, submit support inquiries with attachments, track ticket updates, and chat with operations staff in real-time.
- **Admin Operations Portal**: Real-time ticket queue, priority sorting, status updates, team internal notes, and AI-assisted reply drafting.
- **Real-Time Communication**: Live messaging, typing status, and instant ticket state updates powered by Socket.IO.

---

## 2. Environment Variables

All backend endpoints are managed in **[`src/config.ts`](./src/config.ts)**. By default, production builds automatically point to the deployed Render backend without requiring manual configuration.

If you wish to override the backend URL locally or in your deployment dashboard (e.g., Vercel), create a `.env` file in the `frontend/` folder:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | *(Optional)* Custom backend URL | `https://book-leaf-2x6o.onrender.com` |
| `VITE_SOCKET_URL` | *(Optional)* Custom WebSocket server URL | Same as `VITE_API_URL` |

> **Note**: In development (`npm run dev`), Vite's dev server proxies `/api`, `/uploads`, and `/socket.io` to your backend target defined in `vite.config.ts`.

---

## 3. How to Start the App

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Steps

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

3. **Build for production (e.g. Vercel):**
   ```bash
   npm run build
   ```
   Generates optimized static assets in the `dist/` directory.

4. **Preview the production build locally:**
   ```bash
   npm run preview
   ```

---

## 4. Deployment to Vercel

This frontend includes a pre-configured **[`vercel.json`](./vercel.json)**:
- Rewrites all client paths (`/(.*)`) to `/index.html` to prevent 404 errors when refreshing pages.
- Connects directly to the backend on Render for real-time WebSocket communication and API requests.
