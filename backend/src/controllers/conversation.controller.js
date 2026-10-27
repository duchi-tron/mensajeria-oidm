import {
  createConversationSchema,
  createMessageSchema,
  listMessagesQuerySchema,
} from "../validators/schemas.js";
import * as conversationService from "../services/conversation.service.js";
import * as messageService from "../services/message.service.js";

export async function create(req, res, next) {
  try {
    const validated = createConversationSchema.parse(req.body);
    const conversation = await conversationService.createConversation(req.userId, validated);
    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const conversations = await conversationService.getUserConversations(req.userId);
    res.status(200).json({ conversations });
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req, res, next) {
  try {
    const query = listMessagesQuerySchema.parse(req.query);
    const result = await messageService.listMessages(req.userId, req.params.id, query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const validated = createMessageSchema.parse(req.body);
    const message = await messageService.createMessage(req.userId, {
      conversationId: req.params.id,
      content: validated.content,
    });

    // En la Etapa 6 se emitirá por Socket.IO aquí
    const io = req.app.get("io");
    if (io) {
      const { broadcastMessage } = await import("../sockets/chat.socket.js");
      await broadcastMessage(io, message).catch((err) =>
        console.error("Fallo al emitir por socket:", err)
      );
    }

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
}