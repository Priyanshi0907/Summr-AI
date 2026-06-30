import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const api = axios.create({ baseURL: API, timeout: 60000 })

export type RepurposeFormat = 'tweet' | 'linkedin' | 'tldr' | 'executive' | 'blog' | 'meeting'

export async function repurposeContent(text: string, format: RepurposeFormat): Promise<any> {
  const { data } = await api.post('/summarize/repurpose', { text, format })
  return data
}
