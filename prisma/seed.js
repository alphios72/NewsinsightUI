const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { execSync } = require('child_process')
const prisma = new PrismaClient()

async function main() {
  try {
    // Check if checks table exists (or any core table)
    await prisma.user.count()
  } catch (e) {
    // P2021: The table does not exist in the current database.
    if (e.code === 'P2021' || e.message.includes('does not exist')) {
      console.log('⚠️ Database tables not found. Initializing schema...')
      try {
        execSync('npx prisma db push --skip-generate', { stdio: 'inherit' })
        console.log('✅ Schema pushed successfully.')
        // Re-connect to ensure client is fresh (optional but safe)
        await prisma.$disconnect()
        await prisma.$connect()
      } catch (pushError) {
        console.error('❌ Failed to push schema:', pushError)
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
