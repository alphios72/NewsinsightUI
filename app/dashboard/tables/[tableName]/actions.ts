'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { ALL_TABLES } from '@/lib/tables'

export async function updateRow(tableName: string, id: number, data: Record<string, any>) {
    const headersList = await headers()
    const role = headersList.get('x-user-role') || 'CONFIGURATOR'

    // Permission Check
    if (role !== 'ADMIN') {
        const perm = await prisma.tablePermission.findUnique({
            where: {
                role_tableName: {
                    role: 'CONFIGURATOR',
                    tableName: tableName,
                },
            },
        })
        if (!perm || !perm.canEdit) {
            throw new Error('Permission denied')
        }
    }

    const tableConfig = ALL_TABLES.find((t) => t.name === tableName)
    if (!tableConfig) throw new Error('Invalid table')

    const model = (prisma as any)[tableConfig.model]

    // Remove ID from data if present to avoid update error
    const { id: _, ...updateData } = data

    try {
        await model.update({
            where: { id },
            data: updateData,
        })
        revalidatePath(`/dashboard/tables/${tableName}`)
        return { success: true }
    } catch (error) {
        console.error('Update failed', error)
        return { success: false, error: 'Update failed' }
    }
}
