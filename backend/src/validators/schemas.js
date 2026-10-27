import { z } from "zod";

export const uuidSchema = z.string().uuid("Identificador UUID inválido");

export const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72, "Máximo 72 bytes para bcrypt"),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const createConversationSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  memberIds: z.array(uuidSchema).min(1, "Debe incluir al menos un participante adicional"),
});

export const createMessageSchema = z.object({
  content: z.string().trim().min(1, "El mensaje no puede estar vacío").max(4000),
});

export const listMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  before: uuidSchema.optional(),
});