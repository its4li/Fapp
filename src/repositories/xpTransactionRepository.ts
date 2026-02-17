import { prisma } from "../config/database";
import { XpTransaction } from "@prisma/client";

export class XpTransactionRepository {
  async create(
    userId: string,
    amount: number,
    source: string,
    metadata?: Record<string, unknown>,
  ): Promise<XpTransaction> {
    return prisma.xpTransaction.create({
      data: { userId, amount, source, metadata: metadata || undefined },
    });
  }

  async sumToday(userId: string, startOfDay: Date): Promise<number> {
    const result = await prisma.xpTransaction.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfDay },
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async countBySourceToday(userId: string, source: string, startOfDay: Date): Promise<number> {
    return prisma.xpTransaction.count({
      where: {
        userId,
        source,
        createdAt: { gte: startOfDay },
      },
    });
  }
}

export const xpTransactionRepository = new XpTransactionRepository();
