import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import * as convCtrl from "../controllers/conversation.controller.js";

export const conversationRouter = Router();

conversationRouter.use(requireAuth);

conversationRouter.post("/", convCtrl.create);
conversationRouter.get("/", convCtrl.list);
conversationRouter.get("/:id/messages", convCtrl.getMessages);
conversationRouter.post("/:id/messages", convCtrl.sendMessage);