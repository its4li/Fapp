import { User } from "@prisma/client";
import { prisma } from "../config/database";
import { xpTransactionRepository } from "../repositories/xpTransactionRepository";
import { antiCheatService } from "./antiCheatService";
import { streakService } from "./streakService";
import { calculateLevel, getDiminishingFactor } from "../utils/xpCalculator";

export interface XpAwardResult {
  xpAwarded: number;
  totalXp: number;
  level: number;
  streakCount: number;
  streakBonusXp: number;
}

export class XpService {
  async awardXp(
    user: User,
    baseAmount: number,
    source: string,
    metadata?: Record<string, unknown>,
  ): Promise<XpAwardResult> {
    const activityCount = await antiCheatService.getDailyActivityCount(user.id, source);
    const factor = getDiminishingFactor(activityCount);
    const adjustedAmount = Math.floor(baseAmount * factor);

    const allowedAmount = await antiCheatService.claimDailyXp(user.id, adjustedAmount);

    let totalXp = user.totalXp;
    let level = user.level;

    if (allowedAmount > 0) {
      const newTotalXp = user.totalXp + allowedAmount;
      const newLevel = calculateLevel(newTotalXp);

      const updatedUser = await prisma.$transaction(async (tx) => {
        await tx.xpTransaction.create({
          data: { userId: user.id, amount: allowedAmount, source, metadata: metadata || undefined },
        });
        return tx.user.update({
          where: { id: user.id },
          data: { totalXp: newTotalXp, level: newLevel },
        });
      });

      totalXp = updatedUser.totalXp;
      level = updatedUser.level;
    }

    await antiCheatService.incrementDailyActivityCount(user.id, source);

    const streakResult = await streakService.updateStreak(user);

    let streakBonusXp = 0;
    if (streakResult.bonusXp > 0) {
      const streakAllowed = await antiCheatService.claimDailyXp(user.id, streakResult.bonusXp);
      if (streakAllowed > 0) {
        const newTotalXp = totalXp + streakAllowed;
        const newLevel = calculateLevel(newTotalXp);

        const updatedUser = await prisma.$transaction(async (tx) => {
          await tx.xpTransaction.create({
            data: {
              userId: user.id,
              amount: streakAllowed,
              source: "streak_bonus",
              metadata: { streakCount: streakResult.streakCount },
            },
          });
          return tx.user.update({
            where: { id: user.id },
            data: { totalXp: newTotalXp, level: newLevel },
          });
        });

        totalXp = updatedUser.totalXp;
        level = updatedUser.level;
        streakBonusXp = streakAllowed;
      }
    }

    return {
      xpAwarded: allowedAmount,
      totalXp,
      level,
      streakCount: streakResult.streakCount || user.streakCount,
      streakBonusXp,
    };
  }
}

export const xpService = new XpService();
