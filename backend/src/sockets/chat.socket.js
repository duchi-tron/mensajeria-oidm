import { Server } from "socket.io";
import { env } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";
import { requireMembership, getConversationMemberIds } from "../services/conversation.service.js";
import { createMessage } from "../services/message.service.js";

export function setupSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  // Middleware de autenticación por Socket
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Token de autenticación requerido"));
    }

    try {
      const payload = verifyToken(token);
      socket.userId = payload.sub;
      next();
    } catch (_err) {
      next(new Error("Token inválido o expirado"));
    }
  });

  io.on("connection", (socket) => {
    // Cada usuario se une a una sala personal con su propio userId
    socket.join(`user:${socket.userId}`);

    // Evento para unirse a una conversación específica
    socket.on("conversation:join", async ({ conversationId }, ack) => {
      try {
        await requireMembership(socket.userId, conversationId);
        socket.join(`conversation:${conversationId}`);
        if (typeof ack === "function") ack({ ok: true });
      } catch (err) {
        if (typeof ack === "function") ack({ ok: false, error: err.message });
      }
    });

    // Evento para salir de la sala de conversación
    socket.on("conversation:leave", ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Envío de mensaje en tiempo real a través del socket
    socket.on("message:send", async ({ conversationId, content }, ack) => {
      try {
        const message = await createMessage(socket.userId, { conversationId, content });
        await broadcastMessage(io, message);
        if (typeof ack === "function") ack({ ok: true, data: message });
      } catch (err) {
        if (typeof ack === "function") ack({ ok: false, error: err.message });
      }
    });
  });

  return io;
}

// Emite el mensaje a los miembros y a la sala de la conversación
export async function broadcastMessage(io, message) {
  // 1. Emisión a la sala de la conversación
  io.to(`conversation:${message.conversationId}`).emit("message:new", message);

  // 2. Emisión a las salas personales de los miembros
  const memberIds = await getConversationMemberIds(message.conversationId);
  for (const memberId of memberIds) {
    io.to(`user:${memberId}`).emit("conversation:updated", {
      conversationId: message.conversationId,
      lastMessage: message,
    });
  }
}