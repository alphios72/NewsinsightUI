'use client'

import { useState, useMemo, useEffect } from 'react'
import { updateRow, deleteRecord } from './actions'
import styles from './TableView.module.css'
import AddRecordModal from './AddRecordModal'
import { ColumnInfo } from '@/lib/db-utils'

interface TableViewProps {
    tableName: string
    initialData: any[]
    canEdit: boolean
    columns: ColumnInfo[]
}

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null
type Filters = { [key: string]: Set<string> }

export default function TableView({ tableName, initialData, canEdit, columns: schemaColumns }: TableViewProps) {
    const [data, setData] = useState(initialData)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState<any>({})

    // Table State
    const [sortConfig, setSortConfig] = useState<SortConfig>(null)
    const [filters, setFilters] = useState<Filters>({})
    const [activePopover, setActivePopover] = useState<string | null>(null)
    const [filterSearch, setFilterSearch] = useState('')

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 50

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [filters, sortConfig])

    // Use schema columns to determine order and keys
    const columns = useMemo(() => {
        if (schemaColumns && schemaColumns.length > 0) {
            return schemaColumns.map(c => c.column_name)
        }
        if (data && data.length > 0) {
            return Object.keys(data[0])
        }
        return []
    }, [schemaColumns, data])

    // Derived Data: Filtered & Sorted
    const processedData = useMemo(() => {
        let result = [...data]

        // 1. Filter
        Object.keys(filters).forEach(key => {
            if (filters[key].size > 0) {
                result = result.filter(row => {
                    const cellValue = String(row[key])
                    return filters[key].has(cellValue)
                })
            }
        })

        // 2. Sort
        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key]
                const bVal = b[sortConfig.key]

                if (aVal === bVal) return 0
                if (aVal === null || aVal === undefined) return 1
                if (bVal === null || bVal === undefined) return -1

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
                }

                const aStr = String(aVal).toLowerCase()
                const bStr = String(bVal).toLowerCase()
                return sortConfig.direction === 'asc'
                    ? aStr.localeCompare(bStr)
                    : bStr.localeCompare(aStr)
            })
        }

        return result
    }, [data, filters, sortConfig])

    // Pagination Logic
    const totalPages = Math.ceil(processedData.length / rowsPerPage)
    const paginatedData = processedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    )

    // Handlers
    const startEdit = (row: any) => {
        setEditingId(row.id)
        setEditForm({ ...row })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({})
    }

    const handleSave = async () => {
        if (!editingId) return
        await updateRow(tableName, editingId, editForm)

        // Update local state optimistic logic or refresh
        // For simplicity, update local data array
        setData(prev => prev.map(row => row.id === editingId ? { ...editForm } : row))
        setEditingId(null)
    }

    const handleChange = (col: string, value: any) => {
        setEditForm((prev: any) => ({ ...prev, [col]: value }))
    }

    // Filter Logic
    const toggleFilter = (col: string, value: string) => {
        setFilters(prev => {
            const next = new Set(prev[col] || [])
            if (next.has(value)) next.delete(value)
            else next.add(value)

            const newFilters = { ...prev, [col]: next }
            if (next.size === 0) delete newFilters[col]
            return newFilters
        })
    }

    const clearFilter = (col: string) => {
        setFilters(prev => {
            const copy = { ...prev }
            delete copy[col]
            return copy
        })
    }

    const selectAllFilters = (col: string, values: string[]) => {
        setFilters(prev => ({
            ...prev,
            [col]: new Set(values)
        }))
    }

    const getUniqueValues = (col: string) => {
        const values = new Set<string>()
        data.forEach(row => {
            const val = row[col]
            if (val !== null && val !== undefined) values.add(String(val))
            else values.add('(Blanks)')
        })
        return Array.from(values).sort()
    }

    // State for Add Modal
    const [showAddModal, setShowAddModal] = useState(false)

    // Helper to check column type
    const isBooleanCol = (colName: string) => {
        const colDef = schemaColumns.find(c => c.column_name === colName)
        return colDef?.data_type === 'boolean'
    }

    return (
        <div className={styles.tableContainer}>
            <div className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 className={styles.title}>{tableName}</h2>
                    <button
                        className={styles.btnPrimary}
                        onClick={() => setShowAddModal(true)}
                        style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        + Add Record
                    </button>
                </div>
                <div className={styles.tableHeader}>
                    <div className={styles.resultCount}>
                        Showing {paginatedData.length} of {processedData.length} records
                        {processedData.length !== data.length && ` (filtered from ${data.length})`}
                    </div>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col} className={styles.th}>
                                    <div className={styles.headerContent} onClick={() => {
                                        if (activePopover === col) setActivePopover(null)
                                        else {
                                            setActivePopover(col)
                                            setFilterSearch('')
                                        }
                                    }}>
                                        <span>{col}</span>
                                        <div className={`${styles.filterIcon} ${(filters[col] || sortConfig?.key === col) ? styles.active : ''}`}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Popover */}
                                    {activePopover === col && (
                                        <>
                                            <div
                                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
                                                onClick={(e) => { e.stopPropagation(); setActivePopover(null); }}
                                            />
                                            <div className={styles.popover} onClick={e => e.stopPropagation()}>
                                                <div className={styles.popoverContent}>
                                                    <div className={styles.sortButtons}>
                                                        <button className={styles.sortBtn} onClick={() => {
                                                            setSortConfig({ key: col, direction: 'asc' })
                                                            setActivePopover(null)
                                                        }}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                                                            Sort A-Z
                                                        </button>
                                                        <button className={styles.sortBtn} onClick={() => {
                                                            setSortConfig({ key: col, direction: 'desc' })
                                                            setActivePopover(null)
                                                        }}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                                                            Sort Z-A
                                                        </button>
                                                    </div>

                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        value={filterSearch}
                                                        onChange={e => setFilterSearch(e.target.value)}
                                                        className={styles.searchBox}
                                                    />

                                                    <div className={styles.valuesList}>
                                                        {getUniqueValues(col)
                                                            .filter(v => v.toLowerCase().includes(filterSearch.toLowerCase()))
                                                            .map(val => (
                                                                <label key={val} className={styles.valueItem}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={filters[col]?.has(val) ?? false}
                                                                        onChange={() => toggleFilter(col, val)}
                                                                    />
                                                                    <span>{val}</span>
                                                                </label>
                                                            ))
                                                        }
                                                    </div>

                                                    <div className={styles.popoverActions}>
                                                        <button className={styles.actionLink} onClick={() => {
                                                            const visibleValues = getUniqueValues(col).filter(v => v.toLowerCase().includes(filterSearch.toLowerCase()))
                                                            selectAllFilters(col, visibleValues)
                                                        }}>Select All</button>
                                                        <button className={styles.actionLink} onClick={() => clearFilter(col)}>Clear Filter</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </th>
                            ))}
                            {canEdit && <th className={styles.th}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row) => {
                            const isEditing = editingId === row.id
                            return (
                                <tr key={row.id} className={`${styles.row} ${isEditing ? styles.editing : ''}`}>
                                    {columns.map(col => (
                                        <td key={col} className={styles.td}>
                                            {isEditing && col !== 'id' ? (
                                                isBooleanCol(col) ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm[col] || false}
                                                        onChange={e => handleChange(col, e.target.checked)}
                                                    />
                                                ) : (
                                                    <input
                                                        className={styles.input}
                                                        type="text"
                                                        value={editForm[col] !== null ? editForm[col] : ''}
                                                        onChange={e => handleChange(col, e.target.value)}
                                                    />
                                                )
                                            ) : (
                                                <span className={styles.cellValue} title={String(row[col])}>
                                                    {String(row[col])}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                    {canEdit && (
                                        <td className={styles.td}>
                                            {isEditing ? (
                                                <div className={styles.btnGroup}>
                                                    <button onClick={handleSave} className={styles.saveBtn}>Save</button>
                                                    <button onClick={cancelEdit} className={styles.cancelBtn}>Can</button>
                                                </div>
                                            ) : (
                                                <div className={styles.btnGroup}>
                                                    <button onClick={() => startEdit(row)} className={styles.editBtn}>Edit</button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
                                                                deleteRecord(tableName, row.id).then(res => {
                                                                    if (res.success) {
                                                                        // Optimistic update or just refresh
                                                                        setData(prev => prev.filter(r => r.id !== row.id))
                                                                        // window.location.reload() // Optional, but local update is smoother
                                                                    } else {
                                                                        alert('Failed to delete: ' + res.error)
                                                                    }
                                                                })
                                                            }
                                                        }}
                                                        className={styles.deleteBtn}
                                                        style={{ marginLeft: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                                                    >
                                                        Del
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {processedData.length === 0 && (
                    <div className={styles.emptyState}>
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                            No records found. Click "Add Record" to create one.
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <div>Page {currentPage} of {totalPages}</div>
                    <div className={styles.pageControls}>
                        <button
                            className={styles.pageBtn}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            Previous
                        </button>
                        <button
                            className={styles.pageBtn}
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showAddModal && (
                <AddRecordModal
                    tableName={tableName}
                    columns={schemaColumns}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        window.location.reload()
                    }}
                />
            )}
        </div>
    )
}
