import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { requireMembership } from "./conversation.service.js";
import { publicUserSelect } from "../utils/public-user.js";

export async function createMessage(senderId, { conversationId, content }) {
  if (!content || !content.trim()) {
    throw new HttpError(400, "El contenido del mensaje no puede estar vacío");
  }

  await requireMembership(senderId, conversationId);

  return prisma.message.create({
    data: {
      content: content.trim(),
      conversationId,
      senderId,
    },
    include: {
      sender: { select: publicUserSelect },
    },
  });
}

export async function listMessages(userId, conversationId, { limit = 30, before } = {}) {
  await requireMembership(userId, conversationId);

  let cursorFilter = undefined;
  if (before) {
    const cursorMsg = await prisma.message.findUnique({
      where: { id: before },
      select: { conversationId: true, createdAt: true, id: true },
    });

    if (!cursorMsg || cursorMsg.conversationId !== conversationId) {
      throw new HttpError(400, "El cursor indicado no pertenece a esta conversación");
    }

    cursorFilter = {
      id: before,
    };
  }

  const items = await prisma.message.findMany({
    where: { conversationId },
    take: limit + 1,
    skip: cursorFilter ? 1 : 0,
    cursor: cursorFilter,
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" },
    ],
    include: {
      sender: { select: publicUserSelect },
    },
  });

  let nextCursor = null;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem.id;
  }

  return {
    messages: items.reverse(),
    nextCursor,
  };
}