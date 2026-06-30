'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Zap, FileText, BarChart2, Mail, RefreshCw, Download, Star, Check } from 'lucide-react'
import { Show, UserButton } from '@clerk/nextjs'

const FEATURES = [
  { icon: Zap, title: 'Multi-format summarization', desc: 'Paste emails, articles, blogs, research papers or any text. Get short, medium, or detailed summaries instantly.', color: '#7c6af7' },
  { icon: FileText, title: 'Structured extraction', desc: 'Auto-extract bullet points, key takeaways, action items, important names, dates, and questions answered.', color: '#34d399' },
  { icon: BarChart2, title: 'Sentiment & readability', desc: 'Understand tone at a glance. Get sentiment scores, reading time, compression ratio, and difficulty level.', color: '#f472b6' },
  { icon: RefreshCw, title: 'Content repurposing', desc: 'Transform any text into a tweet thread, LinkedIn post, executive summary, or meeting notes in one click.', color: '#fbbf24' },
  { icon: Mail, title: 'Smart email assistant', desc: 'Detect greeting, body, and signature. Auto-generate professional, casual, or follow-up replies with perfect tone.', color: '#60a5fa' },
  { icon: Download, title: 'Export anywhere', desc: 'Download summaries as PDF, DOCX, Markdown, or plain text. Full history with search, filter, and favorites.', color: '#a78bfa' },
]

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Product Manager @ Stripe', text: 'SummrAI saves me 2 hours every day. I go through 50+ emails and articles — this handles it all.', rating: 5 },
  { name: 'Marcus Williams', role: 'Research Lead @ Anthropic', text: 'The research paper summarization is incredible. It extracts exactly what I need without losing critical nuance.', rating: 5 },
  { name: 'Priya Patel', role: 'Founder @ TechStartup', text: "Our team uses SummrAI to digest investor updates, competitive intel, and customer feedback. It's become essential.", rating: 5 },
]

const PRICING = [
  {
    name: 'Free', price: '$0', period: 'forever', popular: false,
    features: ['50 summaries/month', '3 AI models', 'Basic export (TXT, MD)', '7-day history', 'Email assistant'],
    cta: 'Get started free',
  },
  {
    name: 'Pro', price: '$12', period: 'per month', popular: true,
    features: ['Unlimited summaries', 'All AI models', 'All export formats', 'Unlimited history', 'Smart email assistant', 'Analytics dashboard', 'Priority support'],
    cta: 'Start free trial',
  },
  {
    name: 'Team', price: '$39', period: 'per month · 5 users', popular: false,
    features: ['Everything in Pro', 'Team workspace', 'Shared history', 'API access', 'SSO / SAML', 'Dedicated support'],
    cta: 'Contact sales',
  },
]

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.08 } } }

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-[60px]"
        style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)' }}>
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="text-lg font-bold gradient-text">
          SummrAI
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden md:flex gap-8">
          {['Features', 'Pricing', 'How it works'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
              {l}
            </a>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 items-center">
          <Show when="signed-in">
            <Link href="/dashboard">
              <button className="text-sm px-4 py-2 rounded-lg transition-all mr-1"
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-color2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}>
                Dashboard
              </button>
            </Link>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in">
              <button className="text-sm px-4 py-2 rounded-lg transition-all"
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-color2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}>
                Sign in
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="text-sm px-4 py-2 rounded-lg font-medium btn-gradient">
                Get started
              </button>
            </Link>
          </Show>
        </motion.div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="relative flex flex-col items-center justify-center text-center pt-36 pb-24 px-6 overflow-hidden">
        {/* Orbs */}
        <div className="orb w-[500px] h-[500px] -top-24 left-1/2 -translate-x-1/2" style={{ background: '#7c6af7' }} />
        <div className="orb w-[350px] h-[350px] top-24 right-[10%]" style={{ background: '#f472b6' }} />
        <div className="orb w-[280px] h-[280px] bottom-0 left-[5%]" style={{ background: '#34d399' }} />

        <motion.div style={{ y: heroY }} className="relative z-10 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-8"
            style={{ background: 'rgba(124,106,247,0.15)', border: '1px solid rgba(124,106,247,0.3)', color: 'var(--accent-purple2)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: 'var(--accent-green)' }} />
            Powered by Claude AI · Now in public beta
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-[-3px] mb-6">
            Turn walls of text<br />into <span className="gradient-text">clear insights</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="text-lg max-w-[580px] mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Summarize emails, articles, research papers, and PDFs in seconds.
            Extract key takeaways, action items, and sentiment with enterprise-grade AI.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="flex gap-3 flex-wrap justify-center">
            <Link href="/dashboard">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base btn-gradient">
                Start summarizing free <ArrowRight size={16} />
              </button>
            </Link>
            <a href="#features">
              <button className="px-7 py-3.5 rounded-xl font-medium text-base transition-all"
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                See all features
              </button>
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex gap-12 mt-16 flex-wrap justify-center">
            {[['10M+', 'Documents summarized'], ['94%', 'Time saved on average'], ['50K+', 'Teams using SummrAI']].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="text-3xl font-bold gradient-text">{n}</div>
                <div className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center text-xs font-semibold tracking-[2px] uppercase mb-3" style={{ color: 'var(--accent-purple2)' }}>Features</motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold text-center tracking-tight mb-3">Everything you need to cut through noise</motion.h2>
          <motion.p variants={fadeUp} className="text-center max-w-lg mx-auto mb-12 text-base" style={{ color: 'var(--text-secondary)' }}>
            From a single email to a 100-page research paper, SummrAI gives you the signal without the noise.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <motion.div key={title} variants={fadeUp}
                className="p-6 rounded-xl transition-all duration-300 cursor-default group"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                whileHover={{ y: -4, borderColor: 'var(--border-color2)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${color}20` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center text-xs font-semibold tracking-[2px] uppercase mb-3" style={{ color: 'var(--accent-purple2)' }}>How it works</motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold text-center tracking-tight mb-3">Three steps to clarity</motion.h2>
          <motion.p variants={fadeUp} className="text-center max-w-md mx-auto mb-12" style={{ color: 'var(--text-secondary)' }}>
            No complicated setup. Paste your text and let the AI do the heavy lifting.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Paste your content', desc: 'Drop in any text — emails, articles, research papers. Up to 50,000 words per summary.', color: '#7c6af7' },
              { step: '02', title: 'Choose your output', desc: 'Select summary length, enable structured extraction, pick export format and AI model.', color: '#f472b6' },
              { step: '03', title: 'Get instant results', desc: 'Receive a comprehensive summary with metadata. Save, share, or export in seconds.', color: '#34d399' },
            ].map(({ step, title, desc, color }) => (
              <motion.div key={step} variants={fadeUp}
                className="p-7 rounded-xl relative overflow-hidden"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                <div className="text-6xl font-black mb-4 leading-none" style={{ color: `${color}20` }}>{step}</div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center text-xs font-semibold tracking-[2px] uppercase mb-3" style={{ color: 'var(--accent-purple2)' }}>Testimonials</motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold text-center tracking-tight mb-12">Loved by knowledge workers</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, text, rating }) => (
              <motion.div key={name} variants={fadeUp}
                className="p-6 rounded-xl"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, i) => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>"{text}"</p>
                <div>
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-24">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center text-xs font-semibold tracking-[2px] uppercase mb-3" style={{ color: 'var(--accent-purple2)' }}>Pricing</motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold text-center tracking-tight mb-3">Simple, transparent pricing</motion.h2>
          <motion.p variants={fadeUp} className="text-center mb-12" style={{ color: 'var(--text-secondary)' }}>Start free. Scale as you grow. No hidden fees.</motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING.map(({ name, price, period, popular, features, cta }) => (
              <motion.div key={name} variants={fadeUp}
                className="p-7 rounded-xl flex flex-col"
                style={{
                  background: popular ? 'rgba(124,106,247,0.06)' : 'var(--card-bg)',
                  border: `1px solid ${popular ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                }}>
                {popular && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full self-start mb-3"
                    style={{ background: 'var(--accent-purple)', color: '#fff' }}>
                    Most popular
                  </span>
                )}
                <div className="font-semibold mb-1">{name}</div>
                <div className="text-4xl font-extrabold tracking-tight">{price}</div>
                <div className="text-xs mb-6 mt-0.5" style={{ color: 'var(--text-secondary)' }}>{period}</div>
                <ul className="flex flex-col gap-2.5 flex-1 mb-7">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Check size={14} color="var(--accent-green)" strokeWidth={2.5} className="flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard">
                  <button className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${popular ? 'btn-gradient' : ''}`}
                    style={!popular ? { background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' } : {}}>
                    {cta}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl p-12 text-center"
          style={{ background: 'rgba(124,106,247,0.08)', border: '1px solid rgba(124,106,247,0.25)' }}>
          <div className="orb w-64 h-64 -top-16 -left-16" style={{ background: '#7c6af7', opacity: 0.12 }} />
          <div className="orb w-64 h-64 -bottom-16 -right-16" style={{ background: '#f472b6', opacity: 0.12 }} />
          <h2 className="relative text-3xl font-bold tracking-tight mb-3">Ready to reclaim your time?</h2>
          <p className="relative mb-8" style={{ color: 'var(--text-secondary)' }}>Join 50,000+ teams that use SummrAI to stay on top of information overload.</p>
          <Link href="/dashboard">
            <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold btn-gradient">
              Start for free — no credit card needed <ArrowRight size={16} />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 py-10 text-center text-sm" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
        <div className="font-bold gradient-text text-lg mb-2">SummrAI</div>
        <p>© {new Date().getFullYear()} SummrAI. Built with Claude AI. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          {['Privacy', 'Terms', 'Blog', 'GitHub'].map(l => (
            <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
