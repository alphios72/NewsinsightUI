'use client'

import { useState, useEffect } from 'react'
import { updatePermission, updateTableLabelAction } from './actions'

type Permission = {
    tableName: string
    canView: boolean
    canEdit: boolean
}

type TableItem = {
    name: string
    label: string
}

export default function PermissionsTable({
    initialPermissions,
    allTables
}: {
    initialPermissions: any[],
    allTables: TableItem[]
}) {
    const [loading, setLoading] = useState<string | null>(null)
    const [labels, setLabels] = useState<Record<string, string>>({})

    useEffect(() => {
        const initialLabels: Record<string, string> = {}
        allTables.forEach(t => initialLabels[t.name] = t.label)
        setLabels(initialLabels)
    }, [allTables])

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

    const handleLabelChange = (tableName: string, value: string) => {
        setLabels(prev => ({ ...prev, [tableName]: value }))
    }

    const saveLabel = async (tableName: string) => {
        const newLabel = labels[tableName]
        if (!newLabel || newLabel === tableName) return // Optional: don't save if same? Or save to be explicit.

        // Optimistic check? 
        // Just save.
        setLoading(`${tableName}-label`)
        try {
            await updateTableLabelAction(tableName, newLabel)
        } finally {
            setLoading(null)
        }
    }

    return (
        <table className="permissions-table">
            <thead>
                <tr>
                    <th>Table Name</th>
                    <th>Display Name</th>
                    <th className="center">View Access</th>
                    <th className="center">Edit Access</th>
                </tr>
            </thead>
            <tbody>
                {allTables.map((table) => {
                    const perm = getPerm(table.name)
                    return (
                        <tr key={table.name}>
                            <td className="mono">{table.name}</td>
                            <td>
                                <input
                                    type="text"
                                    value={labels[table.name] || table.label}
                                    onChange={(e) => handleLabelChange(table.name, e.target.value)}
                                    onBlur={() => saveLabel(table.name)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.currentTarget.blur()
                                        }
                                    }}
                                    className="label-input"
                                    placeholder="Enter generic label..."
                                />
                            </td>
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
        .label-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }
        .label-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
      `}</style>
        </table>
    )
}
