import { Router } from "express";
import { aiChat, aiChatSchema } from "../controllers/aiController";
import { validate } from "../middleware/validate";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post(
  "/chat",
  rateLimiter({ windowMs: 60_000, max: 10, keyPrefix: "ai" }),
  validate(aiChatSchema),
  aiChat,
);

export default router;
