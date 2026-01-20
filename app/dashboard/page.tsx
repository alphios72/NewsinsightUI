import { getDashboardStats } from './actions'
import OverviewCharts from './OverviewCharts'

export default async function DashboardPage() {
    const stats = await getDashboardStats()

    return (
        <div>
            <h1 className="title">Dashboard</h1>
            <p className="subtitle">Welcome to NewsInsight AI Administration.</p>

            <OverviewCharts
                articleCount={stats.articleCount}
                sources={stats.sources}
                wordCloudData={stats.wordCloudData}
            />

            <style>{`
        .title {
            font-size: 2rem;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }
        .subtitle {
            color: #64748b;
            margin-bottom: 2rem;
        }
      `}</style>
        </div>
    )
}
