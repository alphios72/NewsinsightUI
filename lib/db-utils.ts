import { prisma } from '@/lib/prisma'

export interface ColumnInfo {
    column_name: string
    data_type: string
    is_nullable: string
    column_default: string | null
}

export async function getDatabaseTables(): Promise<string[]> {
    // Query information_schema for all base tables in the public schema
    const result = await prisma.$queryRaw<{ table_name: string }[]>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name != '_prisma_migrations'
        ORDER BY table_name ASC;
    `
    return result.map(r => r.table_name)
}

export async function getTableColumns(tableName: string): Promise<ColumnInfo[]> {
    // Validate table name to prevent injection since we can't parameterize identifier in dynamic SQL easily without validation
    const validTables = await getDatabaseTables()
    if (!validTables.includes(tableName)) {
        throw new Error(`Invalid table name: ${tableName}`)
    }

    const result = await prisma.$queryRaw<ColumnInfo[]>`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
        ORDER BY ordinal_position ASC;
    `
    return result
}

export async function getTableData(tableName: string, limit: number = 100, offset: number = 0) {
    const validTables = await getDatabaseTables()
    if (!validTables.includes(tableName)) {
        throw new Error(`Invalid table name: ${tableName}`)
    }

    // Use queryRawUnsafe for dynamic table name selection
    // We validated the table name above, so this is safe(r)
    return prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}" LIMIT ${limit} OFFSET ${offset}`)
}
