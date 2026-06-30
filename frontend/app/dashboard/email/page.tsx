'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { analyzeEmail } from '@/services/emailService'
import { Copy, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { toast } from '@/hooks/useToast'

const SAMPLE = `From: david.nguyen@techcorp.com
To: sarah.jones@company.com
Subject: Partnership Proposal — Integrated API Solution

Dear Sarah,

Following our conversation at the SaaS Summit last month, I'm formalizing our partnership discussion around our API integration capabilities.

TechCorp's middleware solution has entered general availability. Based on challenges your team described around data synchronization between your CRM and billing systems, I believe there's a compelling fit. Our platform handles real-time bidirectional sync across 200+ enterprise apps with 99.99% uptime SLA.

I'd like to propose a 30-day pilot at no cost with two dedicated solution engineers.

Proposed next steps:
1. 45-minute technical demo with your engineering lead
2. Review security and compliance documentation
3. Pilot agreement and implementation timeline

I'm available Tuesday through Thursday this week.

Warm regards,
David Nguyen, VP of Partnerships`

type Tone = 'professional' | 'casual' | 'followup'

export default function EmailPage() {
  const [email, setEmail] = useState('')
  const [tone, setTone] = useState<Tone>('professional')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function handleAnalyze() {
    if (!email.trim()) { toast('Paste an email first', 'error'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const data = await analyzeEmail(email, tone)
      setResult(data)
      toast('Email analyzed', 'success')
    } catch (e: any) {
      setError(e.message)
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const urgencyConfig: Record<string, { color: string; icon: any; label: string }> = {
    high: { color: 'var(--accent-pink)', icon: AlertCircle, label: 'High urgency' },
    medium: { color: 'var(--accent-amber)', icon: Clock, label: 'Medium urgency' },
    low: { color: 'var(--accent-green)', icon: CheckCircle, label: 'Low urgency' },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Input */}
      <div className="rounded-xl flex flex-col" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <span className="text-sm font-semibold">Paste email</span>
          <button onClick={() => setEmail(SAMPLE)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            Load sample
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4 flex-1">
          <textarea
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Paste the email you want to analyze and reply to…"
            className="w-full flex-1 rounded-xl text-sm outline-none resize-none leading-relaxed p-4 min-h-[240px]"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          />
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Reply tone:</p>
            <div className="flex gap-2">
              {(['professional', 'casual', 'followup'] as Tone[]).map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className={`chip capitalize ${tone === t ? 'chip-active' : ''}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleAnalyze} disabled={loading}
            className="w-full py-2.5 rounded-xl font-medium text-sm btn-gradient disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Analyzing…' : '📧 Analyze & generate reply'}
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="rounded-xl flex flex-col" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <div className="px-5 py-3.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <span className="text-sm font-semibold">Analysis & reply</span>
        </div>
        <div className="p-5 flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-3 p-2" style={{ color: 'var(--text-secondary)' }}>
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent-purple)' }} />
              <span className="text-sm">Analyzing with Claude…</span>
            </div>
          )}
          {error && !loading && (
            <div className="output-block">
              <p className="text-sm" style={{ color: 'var(--accent-pink)' }}>{error}</p>
            </div>
          )}
          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center" style={{ color: 'var(--text-secondary)' }}>
              <div className="text-4xl mb-3 opacity-30">📧</div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Paste an email to start</p>
              <p className="text-xs">Get structure breakdown and an AI-written reply</p>
            </div>
          )}
          {result && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
              {/* Urgency */}
              {result.urgency && (() => {
                const cfg = urgencyConfig[result.urgency] || urgencyConfig.low
                const Icon = cfg.icon
                return (
                  <div className="flex gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                      style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                      <Icon size={11} /> {cfg.label}
                    </span>
                    {result.sender && (
                      <span className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(124,106,247,0.12)', color: 'var(--accent-purple2)', border: '1px solid rgba(124,106,247,0.25)' }}>
                        👤 {result.sender}
                      </span>
                    )}
                  </div>
                )
              })()}

              {/* Structure */}
              <div className="output-block">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-purple)' }} />
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Email structure</span>
                </div>
                <div className="flex flex-col gap-1.5 text-sm">
                  {result.greeting && <div><span className="text-[10px] uppercase tracking-wider mr-2" style={{ color: 'var(--text-secondary)' }}>Greeting</span>{result.greeting}</div>}
                  {result.body && <div><span className="text-[10px] uppercase tracking-wider mr-2" style={{ color: 'var(--text-secondary)' }}>Body</span>{result.body}</div>}
                  {result.conclusion && <div><span className="text-[10px] uppercase tracking-wider mr-2" style={{ color: 'var(--text-secondary)' }}>Sign-off</span>{result.conclusion}</div>}
                </div>
              </div>

              {/* Key points */}
              {result.keyPoints?.length > 0 && (
                <div className="output-block">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-green)' }} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Key points</span>
                  </div>
                  <ul className="text-sm flex flex-col gap-1.5 pl-3">
                    {result.keyPoints.map((p: string, i: number) => <li key={i} className="list-disc" style={{ color: 'var(--text-secondary)' }}>{p}</li>)}
                  </ul>
                </div>
              )}

              {/* Action items */}
              {result.actionItems?.length > 0 && (
                <div className="output-block">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-amber)' }} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Action items</span>
                  </div>
                  <ul className="text-sm flex flex-col gap-1.5 pl-3">
                    {result.actionItems.map((a: string, i: number) => <li key={i} className="list-disc" style={{ color: 'var(--text-secondary)' }}>{a}</li>)}
                  </ul>
                </div>
              )}

              {/* Reply */}
              {result.reply && (
                <div className="output-block" style={{ borderColor: 'rgba(124,106,247,0.3)' }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-purple)' }} />
                      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                        Generated reply ({tone})
                      </span>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(result.reply); toast('Reply copied', 'success') }}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all"
                      style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <Copy size={11} /> Copy
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.reply}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
