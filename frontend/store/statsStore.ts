import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SummaryOutput } from './summaryStore'

export interface HistoryItem {
  id: string
  title: string
  preview: string
  type: 'text' | 'email' | 'article'
  wordCount: number
  compression: string
  createdAt: number
  data: SummaryOutput
}

interface ComputedStats {
  totalSummaries: number
  totalWords: number
  avgCompression: string
  timeSaved: string
}

interface StatsStore {
  history: HistoryItem[]
  stats: ComputedStats
  addSummary: (output: SummaryOutput, type?: HistoryItem['type'], title?: string) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
}

function computeStats(history: HistoryItem[]): ComputedStats {
  const total = history.length
  const totalWords = history.reduce((s, h) => s + h.wordCount, 0)
  const compVals = history.map(h => parseInt(h.compression) || 0).filter(Boolean)
  const avgComp = compVals.length ? Math.round(compVals.reduce((a, b) => a + b, 0) / compVals.length) : 0
  const timeSaved = Math.round(totalWords / 200 * (avgComp / 100))
  return {
    totalSummaries: total,
    totalWords,
    avgCompression: avgComp ? `${avgComp}%` : '—',
    timeSaved: timeSaved > 0 ? `${timeSaved}m` : '0m',
  }
}

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      history: [],
      stats: { totalSummaries: 0, totalWords: 0, avgCompression: '—', timeSaved: '0m' },
      addSummary: (output, type = 'text', title) => {
        const item: HistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          title: title || (output.summary?.slice(0, 80) + '…') || 'Untitled summary',
          preview: output.summary || '',
          type,
          wordCount: output.wordCount || 0,
          compression: output.compression || '?',
          createdAt: Date.now(),
          data: output,
        }
        const history = [item, ...get().history].slice(0, 200)
        set({ history, stats: computeStats(history) })
      },
      removeFromHistory: (id) => {
        const history = get().history.filter(h => h.id !== id)
        set({ history, stats: computeStats(history) })
      },
      clearHistory: () => set({ history: [], stats: computeStats([]) }),
    }),
    { name: 'summrai-stats' }
  )
)
