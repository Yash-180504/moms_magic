import "dotenv/config.js";
import http from "http";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import providerRoutes from "./routes/providers.js";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/orders.js";
import uploadRoutes from "./routes/upload.js";
import { createWebSocketServer } from "./ws/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost origins during development
      if (
        !origin ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        callback(null, true);
        return;
      }

      // Production: allow Vercel frontend domains (production + preview + staging)
      const isVercelDomain =
        origin &&
        (origin.includes(".vercel.app") || origin === process.env.FRONTEND_URL);

      if (isVercelDomain) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Rejected origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api", menuRoutes); // mounts /api/providers/:providerId/menu + /api/menu/:id
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

// Create HTTP server and attach WebSocket
const httpServer = http.createServer(app);
createWebSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🍱 Mom's Magic backend running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready on ws://localhost:${PORT}`);
});
