import { verifyToken } from "../utils/jwt.js";
import { HttpError } from "../utils/http-error.js";

export function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new HttpError(401, "Token de autorización no proporcionado o inválido"));
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch (_err) {
    next(new HttpError(401, "Token expirado o no válido"));
  }
}