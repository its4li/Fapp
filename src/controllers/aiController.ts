import { Request, Response } from "express";
import { z } from "zod";
import { aiService } from "../services/aiService";
import { asyncHandler } from "../middleware/errorHandler";

export const aiChatSchema = z.object({
  message: z.string().min(1).max(2000),
});

export const aiChat = asyncHandler(async (req: Request, res: Response) => {
  const { message } = req.body as z.infer<typeof aiChatSchema>;
  const result = await aiService.chat(req.user!, message);

  res.json({
    message: result.message,
    dailyAiCount: result.dailyAiCount,
    dailyAiLimit: 3,
    xpAwarded: result.xpResult.xpAwarded,
    streakBonusXp: result.xpResult.streakBonusXp,
    totalXp: result.xpResult.totalXp,
    level: result.xpResult.level,
    streakCount: result.xpResult.streakCount,
  });
});
