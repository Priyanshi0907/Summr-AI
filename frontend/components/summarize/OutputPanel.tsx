'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SummaryOutput } from '@/store/summaryStore'
import { Copy, Save, FileDown } from 'lucide-react'
import { toast } from '@/hooks/useToast'
import { useStatsStore } from '@/store/statsStore'
import { exportSummary } from '@/services/summaryService'

interface Props {
  output: SummaryOutput | null
  isLoading: boolean
}

function MetaChip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="text-xs px-2.5 py-1 rounded-full"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {children}
    </span>
  )
}

function Block({ dotColor, label, children }: { dotColor: string; label: string; children: React.ReactNode }) {
  return (
    <div className="output-block">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}

function renderSummaryWithTooltips(summary: string, concepts?: { word: string; explanation: string }[]) {
  if (!concepts || concepts.length === 0) return summary

  const escapedWords = concepts
    .map(c => c?.word?.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
    .filter(Boolean)
  
  if (escapedWords.length === 0) return summary

  const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi')
  const parts = summary.split(regex)
  
  return (
    <>
      {parts.map((part, i) => {
        const matchedConcept = concepts.find(c => c?.word?.toLowerCase() === part.toLowerCase())
        if (matchedConcept) {
          return (
            <span key={i} className="relative group cursor-help underline decoration-dotted decoration-[var(--accent-purple2)] underline-offset-4 font-semibold text-[var(--accent-purple2)] inline-block">
              {part}
              <span className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-xl text-xs leading-relaxed w-64 shadow-2xl z-50 text-left transition-all duration-200 pointer-events-none"
                style={{ background: 'var(--card-bg2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <span className="font-bold text-[var(--accent-purple2)] block mb-1">💡 {matchedConcept.word}</span>
                {matchedConcept.explanation}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent" style={{ borderTopColor: 'var(--card-bg2)' }} />
              </span>
            </span>
          )
        }
        return part
      })}
    </>
  )
}

export default function OutputPanel({ output, isLoading }: Props) {
  const { addSummary } = useStatsStore()
  const [isExporting, setIsExporting] = useState(false)

  async function handleExportPDF() {
    if (!output || !!output.error) return
    setIsExporting(true)
    try {
      const summaryText = output.summary || ''
      const title = summaryText.slice(0, 40) + (summaryText.length > 40 ? '...' : '') || 'Document Summary'
      await exportSummary(title, output, 'pdf')
      toast('PDF exported successfully', 'success')
    } catch (e) {
      console.error('Failed to export PDF:', e)
      toast('Failed to export PDF', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  function copyAll() {
    if (!output) return
    const lines = [
      output.summary,
      output.bullets?.length ? '\nKey Points:\n' + output.bullets.map(b => `• ${b}`).join('\n') : '',
      output.takeaways?.length ? '\nTakeaways:\n' + output.takeaways.map(t => `• ${t}`).join('\n') : '',
      output.actions?.length ? '\nAction Items:\n' + output.actions.map(a => `• ${a}`).join('\n') : '',
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(lines)
    toast('Copied to clipboard', 'success')
  }

  function save() {
    if (output && !output.error) {
      addSummary(output)
      toast('Saved to history', 'success')
    }
  }

  return (
    <div className="rounded-xl flex flex-col min-h-[520px]"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-color)' }}>
        <span className="text-sm font-semibold">Summary output</span>
        <div className="flex gap-2">
          <button onClick={copyAll} disabled={!output || !!output.error}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
            style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <Copy size={12} /> Copy
          </button>
          <button onClick={save} disabled={!output || !!output.error}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
            style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <Save size={12} /> Save
          </button>
          <button onClick={handleExportPDF} disabled={!output || !!output.error || isExporting}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
            style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <FileDown size={12} /> {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-3">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-3 py-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0"
              style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent-purple)' }} />
            <span className="text-sm">Analyzing with Claude…</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !output && (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-12"
            style={{ color: 'var(--text-secondary)' }}>
            <div className="text-4xl mb-3 opacity-30">✨</div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Your summary will appear here</p>
            <p className="text-xs">Paste text on the left and click Generate</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && output?.error && (
          <div className="output-block">
            <p className="text-sm" style={{ color: 'var(--accent-pink)' }}>⚠️ {output.error}</p>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {!isLoading && output && !output.error && (
            <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
              {/* Meta chips */}
              <div className="flex flex-wrap gap-2">
                {output.wordCount && <MetaChip color="#7c6af7">📝 {output.wordCount} words</MetaChip>}
                {output.readingTime && <MetaChip color="#34d399">⏱ {output.readingTime}min read</MetaChip>}
                {output.compression && <MetaChip color="#fbbf24">📉 {output.compression} compressed</MetaChip>}
                {output.difficulty && <MetaChip color="#f472b6">📚 {output.difficulty}</MetaChip>}
                {output.sentiment && (
                  <MetaChip color={output.sentiment === 'positive' ? '#34d399' : output.sentiment === 'negative' ? '#f472b6' : '#7c6af7'}>
                    💬 {output.sentiment}
                  </MetaChip>
                )}
              </div>

              {output.summary && (
                <Block dotColor="#7c6af7" label="Summary">
                  {renderSummaryWithTooltips(output.summary, output.concepts)}
                </Block>
              )}

              {output.bullets && output.bullets.length > 0 && (
                <Block dotColor="#34d399" label="Key points">
                  <ul className="flex flex-col gap-1.5 pl-3">
                    {output.bullets.map((b, i) => <li key={i} className="list-disc" style={{ color: 'var(--text-secondary)' }}>{b}</li>)}
                  </ul>
                </Block>
              )}

              {output.takeaways && output.takeaways.length > 0 && (
                <Block dotColor="#fbbf24" label="Key takeaways">
                  <ul className="flex flex-col gap-1.5 pl-3">
                    {output.takeaways.map((t, i) => <li key={i} className="list-disc" style={{ color: 'var(--text-secondary)' }}>{t}</li>)}
                  </ul>
                </Block>
              )}

              {output.actions && output.actions.length > 0 && (
                <Block dotColor="#f472b6" label="Action items">
                  <ul className="flex flex-col gap-1.5 pl-3">
                    {output.actions.map((a, i) => <li key={i} className="list-disc" style={{ color: 'var(--text-secondary)' }}>{a}</li>)}
                  </ul>
                </Block>
              )}

              {(output.names?.length || output.dates?.length) && (
                <Block dotColor="#a89df5" label="Names & dates">
                  {output.names?.length ? (
                    <div className="mb-1.5">
                      <span className="text-xs mr-2" style={{ color: 'var(--text-secondary)' }}>People & orgs:</span>
                      {output.names.join(', ')}
                    </div>
                  ) : null}
                  {output.dates?.length ? (
                    <div>
                      <span className="text-xs mr-2" style={{ color: 'var(--text-secondary)' }}>Dates:</span>
                      {output.dates.join(', ')}
                    </div>
                  ) : null}
                </Block>
              )}

              {output.sentimentNote && (
                <Block dotColor="#34d399" label="Sentiment analysis">
                  {output.sentimentNote}
                </Block>
              )}

              {/* One-Sentence TLDR */}
              {output.tldr && (
                <Block dotColor="#f472b6" label="One-sentence TLDR">
                  <div className="p-3.5 rounded-xl italic font-medium border-l-4" 
                    style={{ background: 'rgba(244,114,182,0.05)', borderColor: 'var(--accent-pink)', color: 'var(--text-primary)' }}>
                    "{output.tldr}"
                  </div>
                </Block>
              )}

              {/* Questions & Quiz */}
              {output.questions && output.questions.length > 0 && (
                <Block dotColor="#7c6af7" label="Questions & Quiz">
                  <div className="flex flex-col gap-2.5">
                    {output.questions.map((q, i) => {
                      if (typeof q !== 'string') return null
                      const parts = q.split(/A\d+:/)
                      const questionPart = parts[0]?.replace(/^Q\d+:\s*/, '')
                      const answerPart = parts[1]
                      return (
                        <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                          <p className="font-semibold text-xs text-[var(--accent-purple2)] mb-1">❓ {questionPart}</p>
                          {answerPart && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>💡 {answerPart.trim()}</p>}
                        </div>
                      )
                    })}
                  </div>
                </Block>
              )}

              {/* Mind Map Tree */}
              {output.mindmap && (
                <Block dotColor="#10b981" label="Mind Map Tree">
                  <pre className="p-4 rounded-lg overflow-x-auto text-[13px] font-mono leading-relaxed"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    {output.mindmap}
                  </pre>
                </Block>
              )}

              {/* Concept Glossary */}
              {output.concepts && output.concepts.length > 0 && (
                <Block dotColor="#fbbf24" label="Concept Glossary">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {output.concepts.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                        <strong className="text-xs text-[var(--accent-purple2)] block mb-1">💡 {c?.word || ''}</strong>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c?.explanation || ''}</p>
                      </div>
                    ))}
                  </div>
                </Block>
              )}

              {/* Sentence Importance Map */}
              {output.highlights && output.highlights.length > 0 && (
                <Block dotColor="#ef4444" label="Sentence Importance Map">
                  <div className="flex flex-col gap-2.5">
                    {output.highlights.map((h, i) => {
                      const isHigh = h?.importance === 'high'
                      const isMed = h?.importance === 'medium'
                      const bg = isHigh ? 'rgba(239, 68, 68, 0.04)' : isMed ? 'rgba(245, 158, 11, 0.04)' : 'rgba(107, 114, 128, 0.04)'
                      const border = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#6b7280'
                      const textColor = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#9ca3af'
                      const label = isHigh ? 'Very Important' : isMed ? 'Moderately Important' : 'Less Important'
                      
                      return (
                        <div key={i} className="p-3 rounded-lg border-l-4" style={{ background: bg, borderLeftColor: border, borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: border }} />
                            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: textColor }}>{label}</span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{h?.text || ''}</p>
                        </div>
                      )
                    })}
                  </div>
                </Block>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
