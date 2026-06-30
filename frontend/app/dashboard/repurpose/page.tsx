'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { repurposeContent } from '@/services/repurposeService'
import { Copy } from 'lucide-react'
import { toast } from '@/hooks/useToast'

type Format = 'tweet' | 'linkedin' | 'tldr' | 'executive' | 'blog' | 'meeting'

const FORMATS: { id: Format; label: string; desc: string }[] = [
  { id: 'tweet', label: 'Tweet thread', desc: '5-tweet thread' },
  { id: 'linkedin', label: 'LinkedIn post', desc: '200-300 words' },
  { id: 'tldr', label: 'TLDR', desc: '2-3 sentences' },
  { id: 'executive', label: 'Executive summary', desc: '150 words + recs' },
  { id: 'blog', label: 'Blog outline', desc: '5 sections' },
  { id: 'meeting', label: 'Meeting notes', desc: 'Structured notes' },
]

export default function RepurposePage() {
  const [text, setText] = useState('')
  const [fmt, setFmt] = useState<Format>('tweet')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function handle() {
    if (!text.trim()) { toast('Paste content first', 'error'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const data = await repurposeContent(text, fmt)
      setResult(data)
      toast('Content transformed', 'success')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function renderResult() {
    if (!result) return null
    if (fmt === 'tweet') return (
      <div className="flex flex-col">
        {(result.tweets || []).map((t: string, i: number) => (
          <div key={i} className="py-3 text-sm leading-relaxed" style={{ borderBottom: i < result.tweets.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
            {t}
          </div>
        ))}
        {result.hashtags?.length > 0 && (
          <div className="pt-2 text-sm" style={{ color: 'var(--accent-purple2)' }}>
            {result.hashtags.map((h: string) => `#${h}`).join(' ')}
          </div>
        )}
      </div>
    )
    if (fmt === 'linkedin') return (
      <div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.post}</p>
        {result.hashtags?.length > 0 && (
          <p className="text-sm mt-3" style={{ color: 'var(--accent-purple2)' }}>
            {result.hashtags.map((h: string) => `#${h}`).join(' ')}
          </p>
        )}
      </div>
    )
    if (fmt === 'tldr') return <p className="text-base leading-relaxed">{result.tldr}</p>
    if (fmt === 'executive') return (
      <div>
        <p className="text-sm leading-relaxed mb-4">{result.summary}</p>
        {result.recommendations?.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Recommendations</p>
            <ul className="flex flex-col gap-1.5 pl-3">
              {result.recommendations.map((r: string, i: number) => <li key={i} className="text-sm list-disc" style={{ color: 'var(--text-secondary)' }}>{r}</li>)}
            </ul>
          </div>
        )}
      </div>
    )
    if (fmt === 'blog') return (
      <div>
        <p className="font-semibold mb-4">{result.title}</p>
        {(result.sections || []).map((s: any, i: number) => (
          <div key={i} className="mb-4">
            <p className="text-sm font-medium mb-1.5">{s.heading}</p>
            <ul className="pl-3 flex flex-col gap-1">
              {(s.points || []).map((p: string, j: number) => <li key={j} className="text-sm list-disc" style={{ color: 'var(--text-secondary)' }}>{p}</li>)}
            </ul>
          </div>
        ))}
      </div>
    )
    if (fmt === 'meeting') return (
      <div className="flex flex-col gap-3">
        {result.title && <p className="font-semibold">{result.title}</p>}
        {result.decisions?.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-secondary)' }}>Decisions</p>
            <ul className="pl-3 flex flex-col gap-1">
              {result.decisions.map((d: string, i: number) => <li key={i} className="text-sm list-disc" style={{ color: 'var(--text-secondary)' }}>{d}</li>)}
            </ul>
          </div>
        )}
        {result.actionItems?.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-secondary)' }}>Action items</p>
            <ul className="pl-3 flex flex-col gap-1">
              {result.actionItems.map((a: string, i: number) => <li key={i} className="text-sm list-disc" style={{ color: 'var(--text-secondary)' }}>{a}</li>)}
            </ul>
          </div>
        )}
        {result.nextSteps?.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-secondary)' }}>Next steps</p>
            <ul className="pl-3 flex flex-col gap-1">
              {result.nextSteps.map((s: string, i: number) => <li key={i} className="text-sm list-disc" style={{ color: 'var(--text-secondary)' }}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>
    )
    return null
  }

  function getPlainText() {
    if (!result) return ''
    if (fmt === 'tweet') return (result.tweets || []).join('\n\n')
    if (fmt === 'linkedin') return result.post || ''
    if (fmt === 'tldr') return result.tldr || ''
    if (fmt === 'executive') return result.summary || ''
    return JSON.stringify(result, null, 2)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Input */}
      <div className="rounded-xl flex flex-col" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <div className="px-5 py-3.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <span className="text-sm font-semibold">Source content</span>
        </div>
        <div className="p-5 flex flex-col gap-4 flex-1">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste content to transform into different formats…"
            className="w-full rounded-xl text-sm outline-none resize-none leading-relaxed p-4 min-h-[200px]"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          />
          <div>
            <p className="text-xs mb-2.5" style={{ color: 'var(--text-secondary)' }}>Transform into:</p>
            <div className="flex gap-2 flex-wrap">
              {FORMATS.map(({ id, label }) => (
                <button key={id} onClick={() => setFmt(id)}
                  className={`chip ${fmt === id ? 'chip-active' : ''}`}>
                  {label}
                </button>
              ))}
            </div>
            {fmt && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                {FORMATS.find(f => f.id === fmt)?.desc}
              </p>
            )}
          </div>
          <button onClick={handle} disabled={loading}
            className="w-full py-2.5 rounded-xl font-medium text-sm btn-gradient disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Transforming…' : '✍️ Transform content'}
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="rounded-xl flex flex-col" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <span className="text-sm font-semibold">Transformed output</span>
          {result && (
            <button onClick={() => { navigator.clipboard.writeText(getPlainText()); toast('Copied', 'success') }}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <Copy size={11} /> Copy
            </button>
          )}
        </div>
        <div className="p-5 flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-3 p-2" style={{ color: 'var(--text-secondary)' }}>
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent-purple)' }} />
              <span className="text-sm">Transforming with Claude…</span>
            </div>
          )}
          {error && !loading && <p className="text-sm" style={{ color: 'var(--accent-pink)' }}>{error}</p>}
          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center" style={{ color: 'var(--text-secondary)' }}>
              <div className="text-4xl mb-3 opacity-30">✍️</div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Choose a format and transform</p>
              <p className="text-xs">Tweet threads, LinkedIn posts, outlines & more</p>
            </div>
          )}
          {result && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="output-block">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-purple)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  {FORMATS.find(f => f.id === fmt)?.label}
                </span>
              </div>
              {renderResult()}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
