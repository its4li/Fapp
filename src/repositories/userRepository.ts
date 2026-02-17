import { prisma } from "../config/database";
import { User } from "@prisma/client";

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { firebaseUid } });
  }

  async updateProfile(
    id: string,
    data: { displayName?: string; avatarUrl?: string },
  ): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async updateXpAndLevel(id: string, xpIncrement: number, level: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        totalXp: { increment: xpIncrement },
        level,
      },
    });
  }

  async updateStreak(id: string, streakCount: number, lastActiveDate: Date): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { streakCount, lastActiveDate },
    });
  }

  async updateAiCount(id: string, dailyAiCount: number, lastAiReset: Date): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { dailyAiCount, lastAiReset },
    });
  }

  async resetAiCount(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { dailyAiCount: 0, lastAiReset: new Date() },
    });
  }
}

export const userRepository = new UserRepository();
