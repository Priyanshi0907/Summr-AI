import axios from 'axios'
import type { SummaryOutput, SummaryLength, SummaryOption } from '@/store/summaryStore'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  // Attach Clerk JWT if available
  if (typeof window !== 'undefined') {
    try {
      const token = await ((window as any).Clerk?.session?.getToken?.() || (window as any).__clerk_frontend_api?.session?.getToken?.())
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch (e) {
      console.error('Error fetching Clerk token in interceptor:', e)
    }
  }
  return config
})

export interface SummarizeParams {
  text: string
  length: SummaryLength
  options: SummaryOption[]
  model?: string
}

export async function summarizeText(params: SummarizeParams): Promise<SummaryOutput> {
  const { data } = await api.post<SummaryOutput>('/summarize', params)
  return data
}

export async function getSummaryHistory(page = 1, limit = 20) {
  const { data } = await api.get('/history', { params: { page, limit } })
  return data
}

export async function deleteSummary(id: string) {
  await api.delete(`/history/${id}`)
}

export async function exportSummary(title: string, summaryData: SummaryOutput, format: 'pdf' | 'docx' | 'md' | 'txt') {
  const { data } = await api.post('/export', {
    title,
    format,
    data: summaryData
  }, {
    responseType: 'blob'
  })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) || 'summary'
  a.download = `${cleanTitle}.${format}`
  a.click()
  URL.revokeObjectURL(url)
}

export async function getAvailableModels() {
  const { data } = await api.get('/models')
  return data
}
