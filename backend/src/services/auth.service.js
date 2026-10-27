import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { createToken } from "../utils/jwt.js";
import { publicUserSelect } from "../utils/public-user.js";

export async function registerUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, "El correo electrónico ya se encuentra registrado");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: publicUserSelect,
  });

  const token = createToken(user.id);
  return { user, token };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new HttpError(401, "Credenciales incorrectas");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new HttpError(401, "Credenciales incorrectas");
  }

  const token = createToken(user.id);
  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
}