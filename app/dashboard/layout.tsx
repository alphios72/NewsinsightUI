import Link from 'next/link'
import { logout } from '@/app/login/actions'
import { headers } from 'next/headers'
import { ALL_TABLES, TableConfig } from '@/lib/tables'
import { prisma } from '@/lib/prisma'
import Sidebar from './Sidebar'

async function getSidebarTables(role: string): Promise<TableConfig[]> {
    if (role === 'ADMIN') {
        return ALL_TABLES
    }

    // Fetch permissions for CONFIGURATOR
    const permissions = await prisma.tablePermission.findMany({
        where: { role: 'CONFIGURATOR', canView: true },
    })

    const allowedTableNames = new Set(permissions.map((p: { tableName: string }) => p.tableName))
    return ALL_TABLES.filter((t) => allowedTableNames.has(t.name))
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const headersList = await headers()
    const role = headersList.get('x-user-role') || 'CONFIGURATOR'
    const username = (await prisma.user.findFirst({ where: { role: role === 'ADMIN' ? 'ADMIN' : 'CONFIGURATOR' } }))?.username || 'User'

    const navTables = await getSidebarTables(role)

    return (
        <div className="layout">
            <Sidebar
                tables={navTables}
                role={role}
                username={username}
                logoutAction={logout}
            />
            <main className="content">{children}</main>

            <style>{`
        .layout {
          display: flex;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background: #f8f9fa;
        }
        .content {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
        }
      `}</style>
        </div>
    )
}
