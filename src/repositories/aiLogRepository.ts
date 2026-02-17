import { prisma } from "../config/database";
import { AiLog } from "@prisma/client";

export class AiLogRepository {
  async create(userId: string, message: string, response: string, xpAwarded: number): Promise<AiLog> {
    return prisma.aiLog.create({
      data: { userId, message, response, xpAwarded },
    });
  }

  async countToday(userId: string, startOfDay: Date): Promise<number> {
    return prisma.aiLog.count({
      where: {
        userId,
        createdAt: { gte: startOfDay },
      },
    });
  }
}

export const aiLogRepository = new AiLogRepository();
