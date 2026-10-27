import { Router } from "express";
import { getUsers } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const userRouter = Router();

userRouter.get("/", requireAuth, getUsers);