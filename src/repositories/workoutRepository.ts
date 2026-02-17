import { prisma } from "../config/database";
import { Workout, WorkoutCompletion } from "@prisma/client";

export class WorkoutRepository {
  async findById(id: string): Promise<Workout | null> {
    return prisma.workout.findUnique({ where: { id } });
  }

  async findAll(): Promise<Workout[]> {
    return prisma.workout.findMany({ orderBy: { difficulty: "asc" } });
  }

  async findCompletionsSince(userId: string, workoutId: string, since: Date): Promise<WorkoutCompletion[]> {
    return prisma.workoutCompletion.findMany({
      where: {
        userId,
        workoutId,
        createdAt: { gte: since },
      },
    });
  }

  async createCompletion(userId: string, workoutId: string, xpAwarded: number): Promise<WorkoutCompletion> {
    return prisma.workoutCompletion.create({
      data: { userId, workoutId, xpAwarded },
    });
  }

  async countCompletionsToday(userId: string, startOfDay: Date): Promise<number> {
    return prisma.workoutCompletion.count({
      where: {
        userId,
        createdAt: { gte: startOfDay },
      },
    });
  }
}

export const workoutRepository = new WorkoutRepository();
