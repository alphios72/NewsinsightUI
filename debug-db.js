const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Inspecting article_db columns...')
    try {
        const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'article_db'
    `
        console.log(result)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
