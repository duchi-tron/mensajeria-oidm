import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function createToken(userId) {
  return jwt.sign({}, env.JWT_SECRET, {
    algorithm: "HS256",
    subject: userId,
    expiresIn: "8h",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
  });
}