'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSummaryStore } from '@/store/summaryStore'
import { useStatsStore } from '@/store/statsStore'
import { summarizeText } from '@/services/summaryService'
import StatCard from '@/components/dashboard/StatCard'
import InputPanel from '@/components/summarize/InputPanel'
import OutputPanel from '@/components/summarize/OutputPanel'

export default function DashboardPage() {
  const {
    inputText, summaryLength, activeOptions, selectedModel, isLoading, output,
    setInputText, setSummaryLength, setSelectedModel, toggleOption, setLoading, setOutput, clearOutput,
  } = useSummaryStore()
  const { stats } = useStatsStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGenerate()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, summaryLength, activeOptions, selectedModel])

  async function handleGenerate() {
    if (!inputText.trim() || isLoading) return
    setLoading(true)
    clearOutput()
    try {
      const result = await summarizeText({
        text: inputText,
        length: summaryLength,
        options: [...activeOptions],
        model: selectedModel
      })
      setOutput(result)
      useStatsStore.getState().addSummary(result)
    } catch (err: any) {
      setOutput({ error: err.message || 'Summarization failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Summaries" value={stats.totalSummaries} sub="this session" />
        <StatCard label="Words processed" value={stats.totalWords.toLocaleString()} sub="total" />
        <StatCard label="Time saved" value={stats.timeSaved} sub="est. reading time" />
        <StatCard label="Avg. compression" value={stats.avgCompression || '—'} sub="words reduced" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <InputPanel
          ref={textareaRef}
          value={inputText}
          onChange={setInputText}
          summaryLength={summaryLength}
          onLengthChange={setSummaryLength}
          activeOptions={activeOptions}
          onToggleOption={toggleOption}
          onGenerate={handleGenerate}
          onClear={() => {
            setInputText('')
            clearOutput()
          }}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          isLoading={isLoading}
        />
        <OutputPanel output={output} isLoading={isLoading} />
      </div>
    </div>
  )
}
