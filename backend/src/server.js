import { createServer } from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { setupSocketServer } from "./sockets/chat.socket.js";

await prisma.$connect();
console.log("Conexión con PostgreSQL lista");

const httpServer = createServer(app);
const io = setupSocketServer(httpServer);

// Permitir que los controladores de Express puedan acceder a io si es necesario
app.set("io", io);

httpServer.listen(env.PORT, () => {
  console.log(`Servidor HTTP y WebSocket escuchando en http://localhost:${env.PORT}`);
});