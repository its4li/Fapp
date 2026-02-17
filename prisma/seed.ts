import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const workouts = [
    { title: "Morning Stretch", duration: 10, difficulty: "easy", xpReward: 30 },
    { title: "Quick Cardio", duration: 15, difficulty: "easy", xpReward: 40 },
    { title: "Bodyweight Circuit", duration: 20, difficulty: "medium", xpReward: 60 },
    { title: "Core Crusher", duration: 25, difficulty: "medium", xpReward: 70 },
    { title: "HIIT Blast", duration: 30, difficulty: "hard", xpReward: 100 },
    { title: "Full Body Strength", duration: 40, difficulty: "hard", xpReward: 120 },
    { title: "Yoga Flow", duration: 30, difficulty: "easy", xpReward: 50 },
    { title: "Endurance Run", duration: 45, difficulty: "hard", xpReward: 130 },
  ];

  for (const workout of workouts) {
    await prisma.workout.upsert({
      where: { id: workout.title.toLowerCase().replace(/\s+/g, "-") },
      update: workout,
      create: { id: workout.title.toLowerCase().replace(/\s+/g, "-"), ...workout },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
