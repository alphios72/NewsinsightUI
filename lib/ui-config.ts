import fs from 'fs/promises'
import path from 'path'

const CONFIG_FILE = path.join(process.cwd(), 'table-labels.json')

export async function getTableLabels(): Promise<Record<string, string>> {
    try {
        const data = await fs.readFile(CONFIG_FILE, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        // If file doesn't exist or error, return empty map
        return {}
    }
}

export async function saveTableLabel(tableName: string, label: string) {
    const labels = await getTableLabels()
    labels[tableName] = label

    // Create/Update the file
    await fs.writeFile(CONFIG_FILE, JSON.stringify(labels, null, 2))
}

export function getLabelForTable(labels: Record<string, string>, tableName: string) {
    return labels[tableName] || tableName
}
