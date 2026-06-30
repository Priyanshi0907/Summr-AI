import { create } from 'zustand'

export type SummaryLength = 'short' | 'medium' | 'detailed'
export type SummaryOption = 'bullets' | 'takeaways' | 'actions' | 'names' | 'sentiment' | 'questions' | 'mindmap' | 'tldr' | 'concepts' | 'highlights'

export type ModelType = 'bart' | 'distilbart' | 't5' | 'claude'

export interface SummaryOutput {
  summary?: string
  bullets?: string[]
  takeaways?: string[]
  actions?: string[]
  names?: string[]
  dates?: string[]
  sentiment?: string
  sentimentNote?: string
  readingTime?: number
  summaryTime?: number
  wordCount?: number
  compression?: string
  difficulty?: string
  questions?: string[]
  mindmap?: string
  tldr?: string
  concepts?: { word: string; explanation: string }[]
  highlights?: { text: string; importance: 'high' | 'medium' | 'low' }[]
  error?: string
}

interface SummaryStore {
  inputText: string
  summaryLength: SummaryLength
  activeOptions: Set<SummaryOption>
  selectedModel: ModelType
  isLoading: boolean
  output: SummaryOutput | null
  setInputText: (text: string) => void
  setSummaryLength: (len: SummaryLength) => void
  setSelectedModel: (model: ModelType) => void
  toggleOption: (opt: SummaryOption) => void
  setLoading: (v: boolean) => void
  setOutput: (out: SummaryOutput) => void
  clearOutput: () => void
}

export const useSummaryStore = create<SummaryStore>((set) => ({
  inputText: '',
  summaryLength: 'short',
  activeOptions: new Set<SummaryOption>(['bullets', 'takeaways']),
  selectedModel: 'claude',
  isLoading: false,
  output: null,
  setInputText: (inputText) => set({ inputText }),
  setSummaryLength: (summaryLength) => set({ summaryLength }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  toggleOption: (opt) =>
    set((s) => {
      const next = new Set(s.activeOptions)
      next.has(opt) ? next.delete(opt) : next.add(opt)
      return { activeOptions: next }
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setOutput: (output) => set({ output }),
  clearOutput: () => set({ output: null }),
}))
