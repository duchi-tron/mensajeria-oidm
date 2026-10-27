import { registerSchema, loginSchema } from "../validators/schemas.js";
import * as authService from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const validated = registerSchema.parse(req.body);
    const result = await authService.registerUser(validated);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await authService.loginUser(validated);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}