'use client'

import { useState } from 'react'
import { createRecord } from './actions'
import styles from './TableView.module.css'
import { ColumnInfo } from '@/lib/db-utils'

interface AddRecordModalProps {
    tableName: string
    columns: ColumnInfo[]
    onClose: () => void
    onSuccess: () => void
}

function getInputType(dataType: string) {
    if (dataType === 'boolean') return 'boolean'
    if (['integer', 'bigint', 'numeric', 'double precision', 'real'].includes(dataType)) return 'number'
    if (dataType.includes('timestamp') || dataType === 'date') return 'datetime'
    return 'text'
}

export default function AddRecordModal({ tableName, columns, onClose, onSuccess }: AddRecordModalProps) {
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Filter out ID if it's auto-incrementing (usually handled by DB, but if it's not we might need it? 
    // For now assuming ID is auto-generated or not required to be manually input if default constraint exists)
    // Actually, usually users don't input ID.
    const fields = columns.filter(c => c.column_name.toLowerCase() !== 'id')

    const handleChange = (name: string, value: any, dataType: string) => {
        const type = getInputType(dataType)
        let parsedValue = value

        if (type === 'number') {
            parsedValue = value === '' ? null : Number(value)
        } else if (type === 'boolean') {
            parsedValue = value === 'true'
        } else if (type === 'datetime') {
            parsedValue = value ? new Date(value).toISOString() : null
        }

        setFormData(prev => ({ ...prev, [name]: parsedValue }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await createRecord(tableName, formData)
            if (res.error) {
                setError(res.error)
            } else {
                onSuccess()
                onClose()
            }
        } catch (err) {
            setError('An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Add New Record ({tableName})</h2>
                    <button onClick={onClose} className={styles.closeBtn}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    {fields.map(col => {
                        const type = getInputType(col.data_type)
                        const label = col.column_name
                        const isRequired = col.is_nullable === 'NO' && col.column_default === null

                        return (
                            <div key={col.column_name} className={styles.formGroup}>
                                <label htmlFor={col.column_name}>
                                    {label} {isRequired && '*'}
                                </label>

                                {type === 'boolean' ? (
                                    <select
                                        id={col.column_name}
                                        onChange={(e) => handleChange(col.column_name, e.target.value, col.data_type)}
                                        className={styles.input}
                                    >
                                        <option value="">Select...</option>
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </select>
                                ) : type === 'datetime' ? (
                                    <input
                                        type="datetime-local"
                                        id={col.column_name}
                                        onChange={(e) => handleChange(col.column_name, e.target.value, col.data_type)}
                                        className={styles.input}
                                        required={isRequired}
                                        step="1"
                                    />
                                ) : (
                                    <input
                                        type={type === 'number' ? 'number' : 'text'}
                                        id={col.column_name}
                                        onChange={(e) => handleChange(col.column_name, e.target.value, col.data_type)}
                                        className={styles.input}
                                        required={isRequired}
                                    />
                                )}
                            </div>
                        )
                    })}

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.btnSecondary} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.btnPrimary} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
