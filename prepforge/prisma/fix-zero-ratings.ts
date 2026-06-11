import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.contestStats.deleteMany({
    where: {
      currentRating: 0,
      platform: "codeforces",
    },
  });
  console.log(`✅ Deleted ${deleted.count} zero-rating records`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());