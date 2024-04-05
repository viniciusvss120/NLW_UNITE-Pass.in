import { prisma } from "../src/lib/prisma"

async function seed() {
  await prisma.event.create({
    data: {
      id: "ndndnivdnv6-kldnvlsçmdç-57511",
      title: "Unite Sumit",
      slug: "unite-sumit",
      datails: "Um eventp p/ devs apaixonado por codigo",
      maximumAttendees: 120
    }
  })
}

seed().then(() => {
  console.log("Database seeded")
  prisma.$disconnect()
})