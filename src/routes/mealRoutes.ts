import { Router } from "express";
import { logMeal, mealLogSchema } from "../controllers/mealController";
import { validate } from "../middleware/validate";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post(
  "/log",
  rateLimiter({ windowMs: 60_000, max: 20, keyPrefix: "meal" }),
  validate(mealLogSchema),
  logMeal,
);

export default router;
