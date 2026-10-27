import { conversationRouter } from "./routes/conversation.routes.js";
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { authRouter } from "./routes/auth.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

export const app = express();

app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json());

// Healthcheck: Comprobar conexión a PostgreSQL
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, status: "healthy" });
  } catch (_err) {
    res.status(503).json({ ok: false, status: "database unavailable" });
  }
});

// Rutas de la API
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/conversations", conversationRouter);

// 404 para rutas no existentes
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware centralizado de errores al final
app.use(errorHandler);

export default app;