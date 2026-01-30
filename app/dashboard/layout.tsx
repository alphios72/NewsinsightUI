import Link from 'next/link'
import { logout } from '@/app/login/actions'
import { headers } from 'next/headers'
import { getDatabaseTables } from '@/lib/db-utils'
import { prisma } from '@/lib/prisma'
import Sidebar from './Sidebar'

interface NavTable {
    name: string
    label: string
}

async function getSidebarTables(role: string): Promise<NavTable[]> {
    const rawTables = await getDatabaseTables()
    const allTables = rawTables.map(name => ({ name, label: name }))

    if (role === 'ADMIN') {
        return allTables
    }

    // Fetch permissions for CONFIGURATOR
    const permissions = await prisma.tablePermission.findMany({
        where: { role: 'CONFIGURATOR', canView: true },
    })

    const allowedTableNames = new Set(permissions.map((p: { tableName: string }) => p.tableName))
    return allTables.filter((t) => allowedTableNames.has(t.name))
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
