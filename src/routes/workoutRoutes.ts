import { Router } from "express";
import { completeWorkout, listWorkouts, workoutCompleteSchema } from "../controllers/workoutController";
import { validate } from "../middleware/validate";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.get("/list", listWorkouts);

router.post(
  "/complete",
  rateLimiter({ windowMs: 60_000, max: 30, keyPrefix: "workout" }),
  validate(workoutCompleteSchema),
  completeWorkout,
);

export default router;
