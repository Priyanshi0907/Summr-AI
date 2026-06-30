'use client'

import { useStatsStore } from '@/store/statsStore'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import StatCard from '@/components/dashboard/StatCard'
import { motion } from 'framer-motion'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AnalyticsPage() {
  const { stats, history } = useStatsStore()

  // Generate last 7 days dynamically up to today
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d
  }).reverse()

  const weekData = last7Days.map(date => {
    const dayName = DAY_NAMES[date.getDay()]
    const dateString = date.toDateString()
    
    // Filter history items created on this day
    const itemsOnDay = history.filter(h => {
      const hDate = new Date(h.createdAt)
      return hDate.toDateString() === dateString
    })
    
    return {
      day: dayName,
      dateLabel: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      summaries: itemsOnDay.length,
      words: itemsOnDay.reduce((acc, curr) => acc + (curr.wordCount || 0), 0),
    }
  })

  const typeBreakdown = [
    { name: 'Text', count: history.filter(h => h.type === 'text').length, color: '#7c6af7' },
    { name: 'Email', count: history.filter(h => h.type === 'email').length, color: '#f472b6' },
    { name: 'Article', count: history.filter(h => h.type === 'article').length, color: '#34d399' },
  ]
  const maxCount = Math.max(...typeBreakdown.map(t => t.count), 1)

  const tooltipStyle = {
    background: 'var(--card-bg2)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '12px',
  }

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total summaries" value={stats.totalSummaries} />
        <StatCard label="Words processed" value={stats.totalWords.toLocaleString()} />
        <StatCard label="Avg. compression" value={stats.avgCompression || '—'} />
        <StatCard label="Time saved" value={stats.timeSaved} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Bar chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <h3 className="text-sm font-semibold mb-4">Summaries this week</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weekData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(124,106,247,0.05)' }} />
              <Bar dataKey="summaries" fill="#7c6af7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Content breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-5 rounded-xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <h3 className="text-sm font-semibold mb-5">Content breakdown</h3>
          <div className="flex flex-col gap-4">
            {typeBreakdown.map(({ name, count, color }) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>{name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{count}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                    transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Words over time */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="p-5 rounded-xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <h3 className="text-sm font-semibold mb-4">Words processed over time</h3>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="words" stroke="#f472b6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
