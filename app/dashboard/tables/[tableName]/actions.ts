'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getDatabaseTables } from '@/lib/db-utils'

async function validateTable(tableName: string) {
    const validTables = await getDatabaseTables()
    if (!validTables.includes(tableName)) {
        throw new Error(`Invalid table name: ${tableName}`)
    }
}

export async function createRecord(tableName: string, data: Record<string, any>) {
    try {
        await validateTable(tableName)

        const keys = Object.keys(data)
        const values = Object.values(data)

        if (keys.length === 0) {
            return { error: 'No data provided' }
        }

        // Check if ID is provided, if not and we need it, we might need to handle it.
        // But for raw SQL INSERT without ID, if the column is SERIAL/AUTOINCREMENT, it works fine.
        // If the user tries to provide ID manually, keys/values will include it.

        // Construct query: INSERT INTO "tableName" ("col1", "col2") VALUES ($1, $2)
        const columns = keys.map(k => `"${k}"`).join(', ')
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')

        const query = `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders})`

        await prisma.$queryRawUnsafe(query, ...values)

        revalidatePath(`/dashboard/tables`)
        return { success: true }
    } catch (e: any) {
        console.error("Create Record Error:", e)
        return { error: e.message || 'Failed to create record' }
    }
}

export async function updateRow(tableName: string, id: number, data: any) {
    try {
        await validateTable(tableName)

        const keys = Object.keys(data)
        const values = Object.values(data)

        if (keys.length === 0) {
            return { success: true }
        }

        // Construct query: UPDATE "tableName" SET "col1" = $1, "col2" = $2 WHERE "id" = $3
        const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ')

        // Add ID as the last parameter
        const query = `UPDATE "${tableName}" SET ${setClause} WHERE "id" = $${keys.length + 1}`

        await prisma.$queryRawUnsafe(query, ...values, id)

        revalidatePath('/dashboard/tables')
        return { success: true }
    } catch (error: any) {
        console.error('Update Error:', error)
        return { success: false, error: 'Failed to update row' }
    }
}

export async function deleteRecord(tableName: string, id: number) {
    try {
        await validateTable(tableName)

        const query = `DELETE FROM "${tableName}" WHERE "id" = $1`
        await prisma.$queryRawUnsafe(query, id)

        revalidatePath('/dashboard/tables')
        return { success: true }
    } catch (error: any) {
        console.error('Delete Error:', error)
        return { success: false, error: error.message || 'Failed to delete row' }
    }
}
