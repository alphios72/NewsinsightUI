const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
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
