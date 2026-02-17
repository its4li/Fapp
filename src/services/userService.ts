import { User } from "@prisma/client";
import { userRepository } from "../repositories/userRepository";
import { AppError } from "../middleware/errorHandler";

export class UserService {
  async getProfile(userId: string): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  }

  async updateProfile(userId: string, data: { displayName?: string; avatarUrl?: string }): Promise<User> {
    return userRepository.updateProfile(userId, data);
  }
}

export const userService = new UserService();
