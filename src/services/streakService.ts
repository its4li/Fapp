import { User } from "@prisma/client";
import { userRepository } from "../repositories/userRepository";
import { antiCheatService } from "./antiCheatService";
import { isToday, isYesterday } from "../utils/dateUtils";
import { XP_CONFIG } from "../utils/xpCalculator";

export interface StreakResult {
  streakCount: number;
  bonusXp: number;
  updated: boolean;
}

export class StreakService {
  async updateStreak(user: User): Promise<StreakResult> {
    if (isToday(user.lastActiveDate)) {
      return { streakCount: user.streakCount, bonusXp: 0, updated: false };
    }

    const acquired = await antiCheatService.checkStreakLock(user.id);
    if (!acquired) {
      return { streakCount: user.streakCount, bonusXp: 0, updated: false };
    }

    let newStreak: number;
    if (isYesterday(user.lastActiveDate)) {
      newStreak = user.streakCount + 1;
    } else {
      newStreak = 1;
    }

    const bonusXp =
      newStreak > 0 && newStreak % XP_CONFIG.STREAK_BONUS_INTERVAL === 0
        ? XP_CONFIG.STREAK_BONUS_XP
        : 0;

    await userRepository.updateStreak(user.id, newStreak, new Date());

    return { streakCount: newStreak, bonusXp, updated: true };
  }
}

export const streakService = new StreakService();
