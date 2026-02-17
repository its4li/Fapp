import { Request, Response } from "express";
import { z } from "zod";
import { userService } from "../services/userService";
import { asyncHandler } from "../middleware/errorHandler";

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.user!.id);
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    totalXp: user.totalXp,
    level: user.level,
    streakCount: user.streakCount,
    lastActiveDate: user.lastActiveDate,
    createdAt: user.createdAt,
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body as z.infer<typeof updateProfileSchema>;
  const user = await userService.updateProfile(req.user!.id, data);
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    totalXp: user.totalXp,
    level: user.level,
    streakCount: user.streakCount,
  });
});
