import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Upsert AppSettings singleton
  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  // Create overall streak record (goalId = null)
  // Use findFirst + create to avoid null unique-where issues
  const existingOverall = await prisma.streak.findFirst({
    where: { goalId: null },
  });
  if (!existingOverall) {
    await prisma.streak.create({ data: { goalId: null } });
  }

  // Seed goals
  const goalsData = [
    {
      name: "Python / FastAPI",
      emoji: "🐍",
      category: "Learning",
      goalType: "timer",
      dailyTarget: 3.0,
      priority: "must",
      activeDays: [1, 2, 3, 4, 5],
      description: "Build backend skills with Python and FastAPI",
      motivation: "Career transition into backend development",
      sortOrder: 0,
    },
    {
      name: "DSA Practice",
      emoji: "🧩",
      category: "Learning",
      goalType: "timer",
      dailyTarget: 1.5,
      priority: "must",
      activeDays: [1, 2, 3, 4, 5, 6],
      description: "LeetCode and algorithm practice",
      motivation: "Crack technical interviews",
      sortOrder: 1,
    },
    {
      name: "Upwork Proposals",
      emoji: "💼",
      category: "Career",
      goalType: "timer",
      dailyTarget: 1.0,
      priority: "must",
      activeDays: [1, 2, 3, 4, 5],
      description: "Write and submit freelance proposals",
      motivation: "Build income stream while studying",
      sortOrder: 2,
    },
    {
      name: "AWS Study",
      emoji: "☁️",
      category: "Learning",
      goalType: "timer",
      dailyTarget: 1.0,
      priority: "should",
      activeDays: [1, 2, 3, 4, 5],
      description: "AWS certification prep",
      motivation: "Cloud skills for career growth",
      sortOrder: 3,
    },
    {
      name: "Exercise",
      emoji: "💪",
      category: "Health",
      goalType: "checkbox",
      dailyTarget: 0,
      priority: "should",
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      description: "Any form of physical activity counts",
      motivation: "ADHD management, energy, and mood",
      sortOrder: 4,
    },
    {
      name: "Read",
      emoji: "📚",
      category: "Personal",
      goalType: "timer",
      dailyTarget: 0.5,
      priority: "want",
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      description: "Read for at least 30 minutes",
      motivation: "Learning and winding down",
      sortOrder: 5,
    },
  ];

  for (const goalData of goalsData) {
    const { activeDays, ...rest } = goalData;
    const goal = await prisma.goal.create({
      data: {
        ...rest,
        activeDays: activeDays,
      },
    });

    // Create a streak record for each goal
    await prisma.streak.create({
      data: { goalId: goal.id },
    });

    console.log(`  ✅ Created goal: ${goal.emoji} ${goal.name}`);
  }

  // Seed rewards
  const rewardsData = [
    {
      name: "Coffee Break",
      emoji: "☕",
      cost: 30,
      category: "treat",
      description: "Fancy coffee from the shop",
    },
    {
      name: "YouTube Episode",
      emoji: "📺",
      cost: 50,
      category: "activity",
      description: "Watch one episode guilt-free",
    },
    {
      name: "Gaming Session",
      emoji: "🎮",
      cost: 100,
      category: "activity",
      description: "1 hour gaming session",
    },
    {
      name: "Takeout Dinner",
      emoji: "🍕",
      cost: 200,
      category: "treat",
      description: "Order your favourite food",
    },
    {
      name: "New Book",
      emoji: "📖",
      cost: 150,
      category: "purchase",
      description: "Buy that book you've been eyeing",
    },
  ];

  for (const reward of rewardsData) {
    await prisma.reward.create({ data: reward });
    console.log(`  🎁 Created reward: ${reward.emoji} ${reward.name}`);
  }

  console.log("✨ Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
