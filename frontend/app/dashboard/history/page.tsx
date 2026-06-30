'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SortAsc, Trash2, Copy, FileText, Mail, BookOpen, Star, FileDown } from 'lucide-react'
import { useStatsStore } from '@/store/statsStore'
import { useSummaryStore } from '@/store/summaryStore'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/useToast'
import { exportSummary } from '@/services/summaryService'

export default function HistoryPage() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'longest'>('newest')
  const { history, removeFromHistory } = useStatsStore()
  const { setOutput, setInputText } = useSummaryStore()
  const router = useRouter()

  const typeIcon: Record<string, any> = { email: Mail, article: BookOpen, text: FileText }

  const filtered = history
    .filter(h =>
      !query ||
      h.title.toLowerCase().includes(query.toLowerCase()) ||
      h.preview.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'newest') return b.createdAt - a.createdAt
      if (sort === 'oldest') return a.createdAt - b.createdAt
      return b.wordCount - a.wordCount
    })

  function loadItem(item: any) {
    setInputText(item.title)
    setOutput(item.data)
    router.push('/dashboard')
  }

  function copyItem(preview: string) {
    navigator.clipboard.writeText(preview)
    toast('Copied to clipboard', 'success')
  }

  async function downloadPdf(item: any) {
    try {
      await exportSummary(item.title || 'Summary', item.data, 'pdf')
      toast('PDF exported successfully', 'success')
    } catch (e) {
      console.error('Failed to export PDF:', e)
      toast('Failed to export PDF', 'error')
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search summaries…"
            className="w-full pl-8 pr-4 py-2 rounded-lg text-sm outline-none transition-colors"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as any)}
          className="rounded-lg text-sm px-3 py-2 outline-none"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="longest">Longest first</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center" style={{ color: 'var(--text-secondary)' }}>
          <FileText size={40} className="mb-4 opacity-30" />
          <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {history.length ? 'No matches' : 'No summaries yet'}
          </h3>
          <p className="text-sm">{history.length ? 'Try a different search' : 'Generate your first summary to see it here'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item, i) => {
            const Icon = typeIcon[item.type] || FileText
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => loadItem(item)}
                className="flex gap-3 p-4 rounded-xl cursor-pointer transition-all duration-150 group"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-color2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(124,106,247,0.12)' }}>
                  <Icon size={16} style={{ color: 'var(--accent-purple2)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate mb-0.5">{item.title}</div>
                  <div className="flex gap-4 text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                    <span>📝 {item.wordCount} words</span>
                    <span>📉 {item.compression}</span>
                  </div>
                  <div className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {item.preview}
                  </div>
                </div>
                <div className="flex gap-1.5 items-start opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); copyItem(item.preview) }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    title="Copy">
                    <Copy size={13} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); downloadPdf(item) }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    title="Export PDF">
                    <FileDown size={13} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); removeFromHistory(item.id); toast('Deleted', 'error') }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
