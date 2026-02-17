import { prisma } from "../config/database";
import { MealLog } from "@prisma/client";

export class MealRepository {
  async create(
    userId: string,
    data: { calories: number; protein: number; carbs: number; fats: number; xpAwarded: number },
  ): Promise<MealLog> {
    return prisma.mealLog.create({
      data: { userId, ...data },
    });
  }

  async countToday(userId: string, startOfDay: Date): Promise<number> {
    return prisma.mealLog.count({
      where: {
        userId,
        createdAt: { gte: startOfDay },
      },
    });
  }

  async findByUserToday(userId: string, startOfDay: Date): Promise<MealLog[]> {
    return prisma.mealLog.findMany({
      where: {
        userId,
        createdAt: { gte: startOfDay },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const mealRepository = new MealRepository();
