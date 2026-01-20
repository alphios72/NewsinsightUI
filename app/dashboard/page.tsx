export default function DashboardPage() {
    return (
        <div>
            <h1 className="title">Dashboard</h1>
            <p className="subtitle">Welcome to NewsInsight AI Administration.</p>
            <div className="card">
                <p>Select a table from the sidebar to view or edit data.</p>
            </div>

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
        .card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      `}</style>
        </div>
    )
}
