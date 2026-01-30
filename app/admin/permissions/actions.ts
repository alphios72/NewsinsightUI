'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updatePermission(tableName: string, type: 'view' | 'edit', value: boolean) {
    try {
        const existing = await prisma.tablePermission.findUnique({
            where: {
                role_tableName: {
                    role: 'CONFIGURATOR',
                    tableName: tableName,
                },
            },
        })

        if (existing) {
            await prisma.tablePermission.update({
                where: { id: existing.id },
                data: {
                    [type === 'view' ? 'canView' : 'canEdit']: value,
                },
            })
        } else {
            await prisma.tablePermission.create({
                data: {
                    role: 'CONFIGURATOR',
                    tableName,
                    canView: type === 'view' ? value : false,
                    canEdit: type === 'edit' ? value : false,
                },
            })
        }

        revalidatePath('/admin/permissions')
        revalidatePath('/dashboard') // Update sidebar
    } catch (error) {
        console.error('Failed to update permission', error)
        throw new Error('Failed to update permission')
    }
}

import { saveTableLabel } from '@/lib/ui-config'

export async function updateTableLabelAction(tableName: string, label: string) {
    try {
        await saveTableLabel(tableName, label)
        revalidatePath('/admin/permissions')
        revalidatePath('/dashboard') // Update sidebar
        revalidatePath('/admin') // Update admin sidebar
    } catch (error) {
        console.error('Failed to update label', error)
        throw new Error('Failed to update label')
    }
}
