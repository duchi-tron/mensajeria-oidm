import { ZodError } from "zod";
import { HttpError } from "../utils/http-error.js";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Datos de solicitud inválidos",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  console.error("Internal Server Error:", err);
  return res.status(500).json({ error: "Error interno del servidor" });
}