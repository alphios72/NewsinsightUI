import { prisma } from '@/lib/prisma'
import { ALL_TABLES } from '@/lib/tables'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import TableView from './table-view'

// Force dynamic rendering as we rely on headers involved in auth/permissions that might change
export const dynamic = 'force-dynamic'

export default async function TablePage({ params }: { params: Promise<{ tableName: string }> }) {
    const resolvedParams = await params
    const { tableName } = resolvedParams
    const tableConfig = ALL_TABLES.find((t) => t.name === tableName)

    if (!tableConfig) {
        return <div>Table not found</div>
    }

    const headersList = await headers()
    const role = headersList.get('x-user-role') || 'CONFIGURATOR'

    let canView = false
    let canEdit = false

    if (role === 'ADMIN') {
        canView = true
        canEdit = true // Admin can roughly do everything, though explicit perms could restrict if desired. Assuming full access.
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

    // Fetch data
    const model = (prisma as any)[tableConfig.model]
    // Fetch only first 100 or so for simplicity, pagination ideally needed
    const data = await model.findMany({
        take: 5000,
        orderBy: { id: 'desc' },
    })

    // Determine columns from first row if exists, or nothing... 
    // Ideally introspection or schema awareness, but we can infer from data[0] if present
    // If no data, we can't show columns easily without more schema info.
    // We can hardcode columns? Or assume data exists?
    // User "Seeded DB" -> Maybe empty. 
    // Let's assume keys from data[0] if exists. If not, showing "No data" is fine.

    return (
        <div>
            <h1 className="title">{tableConfig.label}</h1>
            <TableView
                tableName={tableName}
                initialData={data}
                canEdit={canEdit}
            />
            <style>{`
        .title {
            font-size: 1.5rem;
            color: #1e293b;
            margin-bottom: 2rem;
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
