'use client'

import { forwardRef, useState } from 'react'
import type { SummaryLength, SummaryOption, ModelType } from '@/store/summaryStore'

const SAMPLES = {
  email: `Subject: Q3 Planning Meeting — Action Required

Hi Sarah,

Following up on our Q3 planning session scheduled for next Thursday September 14 at 2 PM EST.

Two key updates: The budget committee approved an additional $200K for digital transformation, which means we can accelerate the CRM migration project. We've also received vendor proposals from Salesforce, HubSpot, and Dynamics 365 — I need your input on evaluation criteria by end of week.

Marcus from Legal flagged we need to review data residency clauses before any vendor selection. He's free Wednesday afternoon.

Before the meeting please:
- Review attached vendor proposals
- Complete the scoring matrix template
- Confirm attendance for all department heads
- Prepare Q2 retrospective slides

Best, Tom`,
  article: `The rapid advancement of artificial intelligence has fundamentally transformed how we interact with technology. Large language models trained on vast corpora of human-generated text have demonstrated remarkable capabilities across domains from creative writing to scientific reasoning. McKinsey estimates AI could contribute between $13 trillion and $22 trillion annually to the global economy by 2030.

However this technological revolution comes with significant challenges. Researchers at MIT and Stanford have documented cases of AI systems exhibiting unexpected behaviors, raising questions about alignment and safety. The EU enacted the AI Act in 2024 — the first comprehensive regulatory framework for AI globally.

Employment economists are divided on net impact. While automation may displace certain roles, the historical pattern suggests new categories of work will emerge. The Industrial Revolution eliminated agricultural jobs while creating manufacturing positions.

Education systems face particular pressure. Traditional credentials may become less relevant as AI can rapidly acquire specialized knowledge. Universities are experimenting with AI-integrated curricula, while companies like Google and Microsoft have launched certification programs emphasizing human-AI collaboration skills.`,
}

const OPTIONS: { id: SummaryOption; label: string }[] = [
  { id: 'bullets', label: 'Bullet points' },
  { id: 'takeaways', label: 'Key takeaways' },
  { id: 'actions', label: 'Action items' },
  { id: 'names', label: 'Names & dates' },
  { id: 'sentiment', label: 'Sentiment' },
  { id: 'questions', label: 'Questions & Quiz' },
  { id: 'mindmap', label: 'Mind Map' },
  { id: 'tldr', label: 'One-sentence TLDR' },
  { id: 'concepts', label: 'Explain Concepts' },
  { id: 'highlights', label: 'Sentence Highlights' },
]

const LENGTHS: { id: SummaryLength; label: string }[] = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'detailed', label: 'Detailed' },
]

interface Props {
  value: string
  onChange: (v: string) => void
  summaryLength: SummaryLength
  onLengthChange: (v: SummaryLength) => void
  activeOptions: Set<SummaryOption>
  onToggleOption: (v: SummaryOption) => void
  onGenerate: () => void
  onClear: () => void
  selectedModel: ModelType
  onModelChange: (v: ModelType) => void
  isLoading: boolean
}

const InputPanel = forwardRef<HTMLTextAreaElement, Props>(
  ({ value, onChange, summaryLength, onLengthChange, activeOptions, onToggleOption, onGenerate, onClear, selectedModel, onModelChange, isLoading }, ref) => {
    const wordCount = (value.trim().match(/\S+/g) || []).length

    return (
      <div className="rounded-xl flex flex-col min-h-[520px]"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-color)' }}>
          <span className="text-sm font-semibold">Input text</span>
          <select value={selectedModel} onChange={e => onModelChange(e.target.value as ModelType)}
            className="text-xs rounded-lg px-2.5 py-1.5 outline-none"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            <option value="claude">Claude Sonnet</option>
            <option value="claude">Claude Haiku (fast)</option>
            <option value="bart">BART Large CNN</option>
            <option value="distilbart">DistilBART</option>
            <option value="t5">T5 Base</option>
          </select>
        </div>

        <div className="p-5 flex flex-col gap-4 flex-1">
          <textarea
            ref={ref}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={`Paste your email, article, research paper, or any text here…\n\nSupports: emails · articles · blogs · research papers\n\nTry the sample buttons below to get started quickly.`}
            className="w-full rounded-xl text-sm outline-none resize-none leading-relaxed p-4 flex-1 min-h-[200px]"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          />

          {/* Word count + samples */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => onChange(SAMPLES.email)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              📧 Sample email
            </button>
            <button onClick={() => onChange(SAMPLES.article)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              📰 Sample article
            </button>
            <button onClick={onClear}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              Clear
            </button>
            <span className="ml-auto text-xs" style={{ color: 'var(--text-secondary)' }}>
              {wordCount.toLocaleString()} words
            </span>
          </div>

          {/* Length */}
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Summary length:</p>
            <div className="flex gap-2">
              {LENGTHS.map(({ id, label }) => (
                <button key={id} onClick={() => onLengthChange(id)}
                  className={`chip ${summaryLength === id ? 'chip-active' : ''}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Extract:</p>
            <div className="flex gap-2 flex-wrap">
              {OPTIONS.map(({ id, label }) => (
                <button key={id} onClick={() => onToggleOption(id)}
                  className={`chip ${activeOptions.has(id) ? 'chip-active' : ''}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={onGenerate}
            disabled={isLoading || !value.trim()}
            className="w-full py-2.5 rounded-xl font-medium text-sm btn-gradient disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                Generating…
              </>
            ) : '✨ Generate summary'}
          </button>
          <p className="text-center text-xs" style={{ color: 'var(--text-secondary)' }}>⌘ Enter to generate</p>
        </div>
      </div>
    )
  }
)

InputPanel.displayName = 'InputPanel'
export default InputPanel
