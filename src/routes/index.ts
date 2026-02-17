import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import aiRoutes from "./aiRoutes";
import workoutRoutes from "./workoutRoutes";
import mealRoutes from "./mealRoutes";
import userRoutes from "./userRoutes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use(asyncHandler(authMiddleware));

router.use("/ai", aiRoutes);
router.use("/workout", workoutRoutes);
router.use("/meals", mealRoutes);
router.use("/user", userRoutes);

export default router;
