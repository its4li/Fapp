import { Request, Response } from "express";
import { z } from "zod";
import { workoutService } from "../services/workoutService";
import { asyncHandler } from "../middleware/errorHandler";

export const workoutCompleteSchema = z.object({
  workoutId: z.string().uuid(),
});

export const completeWorkout = asyncHandler(async (req: Request, res: Response) => {
  const { workoutId } = req.body as z.infer<typeof workoutCompleteSchema>;
  const result = await workoutService.complete(req.user!, workoutId);

  res.json({
    completionId: result.completionId,
    workoutTitle: result.workoutTitle,
    xpAwarded: result.xpResult.xpAwarded,
    streakBonusXp: result.xpResult.streakBonusXp,
    totalXp: result.xpResult.totalXp,
    level: result.xpResult.level,
    streakCount: result.xpResult.streakCount,
  });
});

export const listWorkouts = asyncHandler(async (_req: Request, res: Response) => {
  const workouts = await workoutService.listWorkouts();
  res.json({ workouts });
});
