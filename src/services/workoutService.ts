import { User } from "@prisma/client";
import { workoutRepository } from "../repositories/workoutRepository";
import { antiCheatService } from "./antiCheatService";
import { xpService, XpAwardResult } from "./xpService";
import { XP_CONFIG } from "../utils/xpCalculator";
import { AppError } from "../middleware/errorHandler";

export interface WorkoutCompleteResult {
  completionId: string;
  workoutTitle: string;
  xpResult: XpAwardResult;
}

export class WorkoutService {
  async complete(user: User, workoutId: string): Promise<WorkoutCompleteResult> {
    const workout = await workoutRepository.findById(workoutId);
    if (!workout) {
      throw new AppError(404, "Workout not found");
    }

    const onCooldown = await antiCheatService.checkCooldown(user.id, `workout:${workoutId}`);
    if (onCooldown) {
      throw new AppError(429, "Workout is on cooldown");
    }

    const xpResult = await xpService.awardXp(user, workout.xpReward, "workout", {
      workoutId: workout.id,
      workoutTitle: workout.title,
      difficulty: workout.difficulty,
    });

    const completion = await workoutRepository.createCompletion(
      user.id,
      workout.id,
      xpResult.xpAwarded,
    );

    await antiCheatService.setCooldown(user.id, `workout:${workoutId}`, XP_CONFIG.COOLDOWNS.WORKOUT);

    return {
      completionId: completion.id,
      workoutTitle: workout.title,
      xpResult,
    };
  }

  async listWorkouts() {
    return workoutRepository.findAll();
  }
}

export const workoutService = new WorkoutService();
