import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { uuidSchema } from "../validators/schemas.js";
import { publicUserSelect } from "../utils/public-user.js";

export async function requireMembership(userId, conversationId) {
  const parsedId = uuidSchema.safeParse(conversationId);
  if (!parsedId.success) {
    throw new HttpError(400, "ID de conversación inválido");
  }

  const member = await prisma.conversationMember.findUnique({
    where: {
      userId_conversationId: { userId, conversationId },
    },
  });

  if (!member) {
    throw new HttpError(403, "No perteneces a esta conversación");
  }

  return member;
}

export async function createConversation(currentUserId, { title, memberIds }) {
  const uniqueMemberIds = Array.from(new Set([...memberIds, currentUserId]));

  if (uniqueMemberIds.length < 2) {
    throw new HttpError(400, "Una conversación requiere al menos dos participantes distintos");
  }

  const usersCount = await prisma.user.count({
    where: { id: { in: uniqueMemberIds } },
  });

  if (usersCount !== uniqueMemberIds.length) {
    throw new HttpError(400, "Uno o más participantes indicados no existen");
  }

  return prisma.conversation.create({
    data: {
      title: title || null,
      members: {
        create: uniqueMemberIds.map((userId) => ({ userId })),
      },
    },
    include: {
      members: {
        include: { user: { select: publicUserSelect } },
      },
    },
  });
}

export async function getUserConversations(userId) {
  return prisma.conversation.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      members: {
        include: { user: { select: publicUserSelect } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getConversationMemberIds(conversationId) {
  const members = await prisma.conversationMember.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
}