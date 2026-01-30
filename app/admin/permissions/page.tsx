import { getDatabaseTables } from '@/lib/db-utils'
import { prisma } from '@/lib/prisma'
import { getTableLabels, getLabelForTable } from '@/lib/ui-config'

// Client component for interaction could be separated, but for simplicity using Server Component with small Client interaction parts if needed, 
// or simpler: Use "use client" for the whole table if interactivity is high. 
// Let's use a server component that renders checkboxes wrapped in a client component?
// Actually, simple forms or client component is better.

// Re-exporting a client component often cleaner.
// Let's make this page a server component passing data to a client component.

import PermissionsTable from './permissions-table'

export const dynamic = 'force-dynamic'

export default async function PermissionsPage() {
    const permissions = await prisma.tablePermission.findMany({
        where: { role: 'CONFIGURATOR' },
    })

    const dbTables = await getDatabaseTables()
    const labels = await getTableLabels()
    const allTables = dbTables.map(name => ({
        name,
        label: getLabelForTable(labels, name)
    }))

    return (
        <div>
            <h1 className="title">Permissions Configuration</h1>
            <p className="subtitle">Manage access for <strong>CONFIGURATOR</strong> role.</p>

            <div className="card">
                <PermissionsTable initialPermissions={permissions} allTables={allTables} />
            </div>

            <style>{`
        .title {
            font-size: 1.5rem;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }
        .subtitle {
            color: #64748b;
            margin-bottom: 2rem;
        }
        .card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      `}</style>
        </div>
    )
}
