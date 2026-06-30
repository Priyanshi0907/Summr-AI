import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const api = axios.create({ baseURL: API, timeout: 60000 })

export interface EmailAnalysis {
  greeting: string | null
  body: string
  conclusion: string | null
  sender: string | null
  keyPoints: string[]
  actionItems: string[]
  urgency: 'high' | 'medium' | 'low'
  reply: string
}

export async function analyzeEmail(text: string, tone: string): Promise<EmailAnalysis> {
  const { data } = await api.post<EmailAnalysis>('/reply', { text, tone })
  return data
}
