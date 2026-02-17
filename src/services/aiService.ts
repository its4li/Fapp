import Groq from "groq-sdk";
import { User } from "@prisma/client";
import { env } from "../config/env";
import { userRepository } from "../repositories/userRepository";
import { aiLogRepository } from "../repositories/aiLogRepository";
import { xpService, XpAwardResult } from "./xpService";
import { isToday } from "../utils/dateUtils";
import { XP_CONFIG } from "../utils/xpCalculator";
import { AppError } from "../middleware/errorHandler";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a supportive wellness assistant for a health and fitness app. 
You help users with workout advice, nutrition guidance, mental wellness tips, and general health questions. 
Keep responses concise, actionable, and encouraging. Do not provide medical diagnoses.`;

export interface AiChatResult {
  message: string;
  dailyAiCount: number;
  xpResult: XpAwardResult;
}

export class AiService {
  async chat(user: User, userMessage: string): Promise<AiChatResult> {
    let currentUser = user;

    if (!isToday(currentUser.lastAiReset)) {
      currentUser = await userRepository.resetAiCount(currentUser.id);
    }

    if (currentUser.dailyAiCount >= XP_CONFIG.AI_DAILY_LIMIT) {
      throw new AppError(429, "Daily AI chat limit reached");
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    const newCount = currentUser.dailyAiCount + 1;
    await userRepository.updateAiCount(currentUser.id, newCount, currentUser.lastAiReset);

    const xpResult = await xpService.awardXp(currentUser, XP_CONFIG.AI_USAGE_XP, "ai_usage", {
      messagePreview: userMessage.substring(0, 100),
    });

    await aiLogRepository.create(currentUser.id, userMessage, responseText, xpResult.xpAwarded);

    return {
      message: responseText,
      dailyAiCount: newCount,
      xpResult,
    };
  }
}

export const aiService = new AiService();
