'use client'

import { useState } from 'react'
import { updatePermission } from './actions'
import { TableConfig } from '@/lib/tables'

type Permission = {
    tableName: string
    canView: boolean
    canEdit: boolean
}

export default function PermissionsTable({
    initialPermissions,
    allTables
}: {
    initialPermissions: any[],
    allTables: TableConfig[]
}) {
    const [loading, setLoading] = useState<string | null>(null)

    const getPerm = (tableName: string) =>
        initialPermissions.find(p => p.tableName === tableName) || { canView: false, canEdit: false }

    const handleToggle = async (tableName: string, type: 'view' | 'edit', currentValue: boolean) => {
        setLoading(`${tableName}-${type}`)
        try {
            await updatePermission(tableName, type, !currentValue)
        } finally {
            setLoading(null)
        }
    }

    return (
        <table className="permissions-table">
            <thead>
                <tr>
                    <th>Table Name</th>
                    <th className="center">View Access</th>
                    <th className="center">Edit Access</th>
                </tr>
            </thead>
            <tbody>
                {allTables.map((table) => {
                    const perm = getPerm(table.name)
                    return (
                        <tr key={table.name}>
                            <td>{table.label} <span className="mono">({table.name})</span></td>
                            <td className="center">
                                <input
                                    type="checkbox"
                                    checked={perm.canView}
                                    disabled={loading !== null}
                                    onChange={() => handleToggle(table.name, 'view', perm.canView)}
                                />
                            </td>
                            <td className="center">
                                <input
                                    type="checkbox"
                                    checked={perm.canEdit}
                                    disabled={loading !== null}
                                    onChange={() => handleToggle(table.name, 'edit', perm.canEdit)}
                                />
                            </td>
                        </tr>
                    )
                })}
            </tbody>
            <style jsx>{`
        .permissions-table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
        }
        th {
          font-weight: 600;
          color: #475569;
          background: #f8fafc;
        }
        .center {
          text-align: center;
        }
        .mono {
          font-family: monospace;
          color: #94a3b8;
          font-size: 0.9em;
        }
        input[type="checkbox"] {
          transform: scale(1.2);
          cursor: pointer;
        }
      `}</style>
        </table>
    )
}
