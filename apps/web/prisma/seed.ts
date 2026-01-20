import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcrypt"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { 
      name: "admin", 
      description: "Full access to all features",
      permissions: {
        users: { read: true, write: true, delete: true },
        reports: { read: true, write: true, delete: true, moderate: true },
        settings: { read: true, write: true },
      }
    },
  })
  console.log("✅ Admin role created/verified")

  await prisma.role.upsert({
    where: { name: "moderator" },
    update: {},
    create: { 
      name: "moderator", 
      description: "Can moderate reports and content",
      permissions: {
        users: { read: true, write: false, delete: false },
        reports: { read: true, write: true, delete: false, moderate: true },
        settings: { read: false, write: false },
      }
    },
  })
  console.log("✅ Moderator role created/verified")

  await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { 
      name: "user", 
      description: "Regular authenticated user",
      permissions: {
        users: { read: false, write: false, delete: false },
        reports: { read: true, write: true, delete: false, moderate: false },
        settings: { read: false, write: false },
      }
    },
  })
  console.log("✅ User role created/verified")

  // Create admin user (only if not existing)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "mayuradmin@gmail.com"
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "let me in!"

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPass, 12)
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrator",
        password: hashedPassword,
        emailVerified: new Date(),
        roles: { 
          create: [
            { role: { connect: { id: adminRole.id } } }
          ] 
        },
      },
    })
    console.log(`✅ Created admin user: ${adminUser.email}`)
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
  }

  console.log("🎉 Seeding complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
