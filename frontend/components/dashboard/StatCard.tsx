interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: string
}

export default function StatCard({ label, value, sub, trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sub}</div>}
      {trend && <div className="text-xs mt-1" style={{ color: 'var(--accent-green)' }}>↑ {trend}</div>}
    </div>
  )
}
