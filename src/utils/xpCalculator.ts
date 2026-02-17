export const XP_CONFIG = {
  DAILY_CAP: 500,
  MEAL_LOG_XP: 20,
  AI_USAGE_XP: 10,
  STREAK_BONUS_XP: 100,
  STREAK_BONUS_INTERVAL: 7,
  AI_DAILY_LIMIT: 3,
  DIMINISHING_FACTORS: [1, 0.75, 0.5, 0.25] as readonly number[],
  COOLDOWNS: {
    WORKOUT: 1800,
    MEAL: 300,
  },
} as const;

export function calculateLevel(totalXp: number): number {
  let level = 1;
  let xpRequired = 100;
  let accumulated = 0;
  while (accumulated + xpRequired <= totalXp) {
    accumulated += xpRequired;
    level++;
    xpRequired = level * 100;
  }
  return level;
}

export function getDiminishingFactor(activityCount: number): number {
  const index = Math.min(activityCount, XP_CONFIG.DIMINISHING_FACTORS.length - 1);
  return XP_CONFIG.DIMINISHING_FACTORS[index];
}
