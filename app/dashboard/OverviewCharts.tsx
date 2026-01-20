'use client'

import { TagCloud } from 'react-tagcloud'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from './overview.module.css'

// Colors for Pie Chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

interface OverviewChartsProps {
    sources: { name: string; value: number }[]
    wordCloudData: { value: string; count: number }[]
    articleCount: number
}

// Custom Tooltip for TagCloud
const customRenderer = (tag: any, size: number, color: string) => (
    <span
        key={tag.value}
        style={{
            fontSize: `${size}px`,
            color: color,
            margin: '0px 3px',
            padding: '0px 3px',
            display: 'inline-block',
            cursor: 'default',
        }}
        title={`${tag.value}: ${tag.count}`}
    >
        {tag.value}
    </span>
)

export default function OverviewCharts({ sources, wordCloudData, articleCount }: OverviewChartsProps) {
    return (
        <div className={styles.grid}>
            {/* Article Count Card */}
            <div className={`${styles.card} ${styles.statCard}`}>
                <h3 className={styles.sectionTitle}>Total Articles</h3>
                <div className={styles.statValue}>{articleCount.toLocaleString()}</div>
                <div className={styles.statLabel}>Stored in Database</div>
            </div>

            {/* Sources Pie Chart */}
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Monitored Sources</h3>
                <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={sources}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {sources.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Word Cloud */}
            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                <h3 className={styles.sectionTitle}>Relevant Topics Word Cloud</h3>
                <div className={styles.wordCloudContainer}>
                    {wordCloudData.length > 0 ? (
                        <TagCloud
                            minSize={12}
                            maxSize={35}
                            tags={wordCloudData}
                            renderer={customRenderer}
                            className="simple-cloud"
                        />
                    ) : (
                        <p className={styles.statLabel}>No relevant items found yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
