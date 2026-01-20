const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  try {
    // Check if checks table exists (or any core table)
    await prisma.user.count()
  } catch (e) {
    // P2021: The table does not exist in the current database.
    if (e.code === 'P2021' || e.message.includes('does not exist')) {
      console.log('⚠️ System tables missing. Initializing ONLY system tables via SQL (safemode)...')
      try {
        // 1. Create Enum (ignore if exists)
        try { await prisma.$executeRawUnsafe(`CREATE TYPE "Role" AS ENUM ('ADMIN', 'CONFIGURATOR');`) } catch (e) { }

        // 2. Create User Table
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "User" (
            "id" SERIAL NOT NULL,
            "username" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "role" "Role" NOT NULL DEFAULT 'CONFIGURATOR',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "User_pkey" PRIMARY KEY ("id")
          );
        `)
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");`)

        // 3. Create TablePermission Table
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "TablePermission" (
            "id" SERIAL NOT NULL,
            "role" "Role" NOT NULL,
            "tableName" TEXT NOT NULL,
            "canView" BOOLEAN NOT NULL DEFAULT false,
            "canEdit" BOOLEAN NOT NULL DEFAULT false,
            CONSTRAINT "TablePermission_pkey" PRIMARY KEY ("id")
          );
        `)
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "TablePermission_role_tableName_key" ON "TablePermission"("role", "tableName");`)

        console.log('✅ System tables created.')
      } catch (sqlError) {
        console.error('❌ Failed to create tables:', sqlError)
        process.exit(1)
      }
    } else {
      throw e
    }
  }

  const adminPwd = await bcrypt.hash('admin_password', 10)
  const configPwd = await bcrypt.hash('configurator_password', 10)

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: adminPwd
    },
    create: {
      username: 'admin',
      password: adminPwd,
      role: 'ADMIN',
    },
  })

  // Create Configurator
  const configurator = await prisma.user.upsert({
    where: { username: 'configurator' },
    update: {
      password: configPwd
    },
    create: {
      username: 'configurator',
      password: configPwd,
      role: 'CONFIGURATOR',
    },
  })

  console.log({ admin, configurator })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
