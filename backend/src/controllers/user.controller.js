import { listUsers } from "../services/user.service.js";

export async function getUsers(req, res, next) {
  try {
    const users = await listUsers(req.userId);
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
}