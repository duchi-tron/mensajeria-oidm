import { prisma } from "../config/prisma.js";
import { publicUserSelect } from "../utils/public-user.js";

export async function listUsers(currentUserId, limit = 50) {
  return prisma.user.findMany({
    where: {
      id: { not: currentUserId },
    },
    take: limit,
    select: publicUserSelect,
    orderBy: { name: "asc" },
  });
}