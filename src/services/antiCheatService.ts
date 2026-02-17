import { redis } from "../config/redis";
import { getDateString, secondsUntilMidnightUTC } from "../utils/dateUtils";
import { XP_CONFIG } from "../utils/xpCalculator";

const CLAIM_XP_SCRIPT = `
local key = KEYS[1]
local amount = tonumber(ARGV[1])
local cap = tonumber(ARGV[2])
local ttl = tonumber(ARGV[3])
local current = tonumber(redis.call('get', key) or '0')
local allowed = math.min(amount, math.max(0, cap - current))
if allowed <= 0 then
  return 0
end
redis.call('incrby', key, allowed)
local current_ttl = redis.call('ttl', key)
if current_ttl < 0 then
  redis.call('expire', key, ttl)
end
return allowed
`;

export class AntiCheatService {
  async checkCooldown(userId: string, activity: string): Promise<boolean> {
    const key = `cooldown:${activity}:${userId}`;
    const exists = await redis.exists(key);
    return exists === 1;
  }

  async setCooldown(userId: string, activity: string, seconds: number): Promise<void> {
    const key = `cooldown:${activity}:${userId}`;
    await redis.set(key, "1", "EX", seconds);
  }

  async claimDailyXp(userId: string, requestedAmount: number): Promise<number> {
    const today = getDateString();
    const key = `daily_xp:${userId}:${today}`;
    const ttl = secondsUntilMidnightUTC();

    const allowed = await redis.eval(
      CLAIM_XP_SCRIPT,
      1,
      key,
      requestedAmount.toString(),
      XP_CONFIG.DAILY_CAP.toString(),
      ttl.toString(),
    );

    return Number(allowed);
  }

  async getDailyXpTotal(userId: string): Promise<number> {
    const today = getDateString();
    const key = `daily_xp:${userId}:${today}`;
    const val = await redis.get(key);
    return val ? parseInt(val, 10) : 0;
  }

  async getDailyActivityCount(userId: string, source: string): Promise<number> {
    const today = getDateString();
    const key = `activity_count:${source}:${userId}:${today}`;
    const val = await redis.get(key);
    return val ? parseInt(val, 10) : 0;
  }

  async incrementDailyActivityCount(userId: string, source: string): Promise<number> {
    const today = getDateString();
    const key = `activity_count:${source}:${userId}:${today}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, secondsUntilMidnightUTC());
    }
    return count;
  }

  async checkStreakLock(userId: string): Promise<boolean> {
    const today = getDateString();
    const key = `streak_lock:${userId}:${today}`;
    const result = await redis.set(key, "1", "EX", secondsUntilMidnightUTC(), "NX");
    return result === "OK";
  }
}

export const antiCheatService = new AntiCheatService();
