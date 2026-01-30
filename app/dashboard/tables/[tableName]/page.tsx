import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import TableView from './table-view'
import { getDatabaseTables, getTableData, getTableColumns } from '@/lib/db-utils'
import { getTableLabels, getLabelForTable } from '@/lib/ui-config'

// Force dynamic rendering as we rely on headers involved in auth/permissions that might change
export const dynamic = 'force-dynamic'

export default async function TablePage({ params }: { params: Promise<{ tableName: string }> }) {
    const resolvedParams = await params
    const { tableName } = resolvedParams

    // Validate table existence
    const validTables = await getDatabaseTables()
    if (!validTables.includes(tableName)) {
        return <div>Table not found</div>
    }

    const headersList = await headers()
    const role = headersList.get('x-user-role') || 'CONFIGURATOR'

    let canView = false
    let canEdit = false

    if (role === 'ADMIN') {
        canView = true
        canEdit = true
    } else {
        // Check DB
        const perm = await prisma.tablePermission.findUnique({
            where: {
                role_tableName: {
                    role: 'CONFIGURATOR',
                    tableName: tableName,
                },
            },
        })
        if (perm && perm.canView) canView = true
        if (perm && perm.canEdit) canEdit = true
    }

    if (!canView) {
        return (
            <div className="error-container">
                <h1>Access Denied</h1>
                <p>You do not have permission to view this table.</p>
            </div>
        )
    }

    // Fetch data dynamically
    const data = await getTableData(tableName, 5000) as any[]

    // Fetch columns dynamically
    const columns = await getTableColumns(tableName)

    // Fetch Custom Label
    const labels = await getTableLabels()
    const displayLabel = getLabelForTable(labels, tableName)

    return (
        <div>
            <h1 className="title">{displayLabel}</h1>
            <TableView
                tableName={tableName}
                initialData={data}
                canEdit={canEdit}
                columns={columns}
            />
            <style>{`
        .title {
            font-size: 1.5rem;
            color: #1e293b;
            margin-bottom: 2rem;
            text-transform: capitalize;
        }
        .error-container {
            text-align: center;
            padding: 4rem;
            color: #ef4444;
        }
      `}</style>
        </div>
    )
}
