import { Request, Response } from "express";
import { z } from "zod";
import { mealService } from "../services/mealService";
import { asyncHandler } from "../middleware/errorHandler";

export const mealLogSchema = z.object({
  calories: z.number().min(0).max(10000),
  protein: z.number().min(0).max(1000),
  carbs: z.number().min(0).max(2000),
  fats: z.number().min(0).max(1000),
});

export const logMeal = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as z.infer<typeof mealLogSchema>;
  const result = await mealService.log(req.user!, input);

  res.json({
    mealLogId: result.mealLogId,
    xpAwarded: result.xpResult.xpAwarded,
    streakBonusXp: result.xpResult.streakBonusXp,
    totalXp: result.xpResult.totalXp,
    level: result.xpResult.level,
    streakCount: result.xpResult.streakCount,
  });
});
