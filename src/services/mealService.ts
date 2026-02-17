import { User } from "@prisma/client";
import { mealRepository } from "../repositories/mealRepository";
import { antiCheatService } from "./antiCheatService";
import { xpService, XpAwardResult } from "./xpService";
import { XP_CONFIG } from "../utils/xpCalculator";
import { AppError } from "../middleware/errorHandler";

export interface MealLogInput {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealLogResult {
  mealLogId: string;
  xpResult: XpAwardResult;
}

export class MealService {
  async log(user: User, input: MealLogInput): Promise<MealLogResult> {
    const onCooldown = await antiCheatService.checkCooldown(user.id, "meal");
    if (onCooldown) {
      throw new AppError(429, "Meal logging is on cooldown");
    }

    const xpResult = await xpService.awardXp(user, XP_CONFIG.MEAL_LOG_XP, "meal_log", {
      calories: input.calories,
    });

    const mealLog = await mealRepository.create(user.id, {
      ...input,
      xpAwarded: xpResult.xpAwarded,
    });

    await antiCheatService.setCooldown(user.id, "meal", XP_CONFIG.COOLDOWNS.MEAL);

    return {
      mealLogId: mealLog.id,
      xpResult,
    };
  }
}

export const mealService = new MealService();
