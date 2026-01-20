import { logout } from '@/app/login/actions'
import { headers } from 'next/headers'
import { ALL_TABLES } from '@/lib/tables'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/app/dashboard/Sidebar'

// Admin layout reuses dashboard structure but with specific sidebar variant
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const headersList = await headers()
    const role = headersList.get('x-user-role') || 'CONFIGURATOR'

    // Ensure only Admin accesses this (Middleware does check, but visual check nice)
    // If not admin, maybe redirect? Assuming middleware handles it.

    const username = (await prisma.user.findFirst({ where: { role: 'ADMIN' } }))?.username || 'Admin'

    return (
        <div className="layout">
            <Sidebar
                tables={ALL_TABLES}
                role={role}
                username={username}
                logoutAction={logout}
                variant="admin"
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
