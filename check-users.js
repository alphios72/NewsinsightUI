const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const users = await prisma.user.findMany()
        console.log('--- DB USERS ---')
        users.forEach(u => {
            console.log(`User: ${u.username} | Pwd: ${u.password}`)
        })
        console.log('----------------')
    } catch (e) {
        console.error("Prisma Error:", e)
    }
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
