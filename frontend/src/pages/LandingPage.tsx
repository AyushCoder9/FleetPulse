import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'
import { motion, useInView } from 'framer-motion'
import {
  AlertTriangle, TrendingDown, Clock, Upload,
  BarChart2, Award, ArrowRight,
  Truck, Zap, CheckCircle, Shield, FileText,
} from 'lucide-react'
import Logo from '@/components/Logo'

/* ── helpers ─────────────────────────────────────────────────────────── */

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [threshold])
  return scrolled
}

function useCounter(target: number, duration = 1600) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return { ref, count }
}

/* ── sub-components ──────────────────────────────────────────────────── */

function FadeUp({ children, delay = 0, className = '' }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Stat({ label, prefix = '', suffix = '', target, decimals = 0 }: {
  label: string
  prefix?: string
  suffix?: string
  target: number
  decimals?: number
}) {
  const { ref, count } = useCounter(target)
  const display = decimals > 0
    ? (count / Math.pow(10, decimals)).toFixed(decimals)
    : count.toLocaleString()
  return (
    <div className="text-center">
      <div className="text-4xl lg:text-5xl font-bold font-data text-primary mb-2">
        {prefix}<span ref={ref}>{display}</span>{suffix}
      </div>
      <p className="text-sm text-muted-foreground max-w-[180px] mx-auto leading-snug">{label}</p>
    </div>
  )
}

function FeatureRow({
  icon: Icon,
  title,
  desc,
  tag,
  reverse = false,
  detail,
}: {
  icon: React.ElementType
  title: string
  desc: string
  tag: string
  reverse?: boolean
  detail: React.ReactNode
}) {
  return (
    <FadeUp>
      <div className={`flex flex-col lg:flex-row items-center gap-12 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        <div className="flex-1 space-y-4">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            {tag}
          </span>
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
            <Icon className="inline h-7 w-7 text-primary mr-2 -mt-1" />
            {title}
          </h3>
          <p className="text-muted-foreground text-base leading-relaxed">{desc}</p>
        </div>
        <div className="flex-1 w-full">{detail}</div>
      </div>
    </FadeUp>
  )
}

/* ── sections ────────────────────────────────────────────────────────── */

function Nav({ scrolled, isSignedIn }: { scrolled: boolean; isSignedIn: boolean }) {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-sm border-b border-border shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size={28} className="text-primary" />
          <span className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            FleetPulse
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-6 ml-4">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Results</a>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {isSignedIn ? (
            <Link
              to="/app/dashboard"
              className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all duration-150 glow-amber"
            >
              Go to app →
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all duration-150 glow-amber"
              >
                Get started →
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  const words = ['Your fleet bills', 'are lying', 'to you.']
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid-dots opacity-40" />
      <div className="absolute inset-0 bg-amber-glow" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-8"
        >
          <Zap className="h-3.5 w-3.5" />
          Fleet Spend & Operations Intelligence
        </motion.div>

        <div className="space-y-0">
          {words.map((word, i) => (
            <motion.div
              key={word}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1
                className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-none tracking-tighter"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span className={i === 2 ? 'text-primary' : 'text-foreground'}>{word}</span>
              </h1>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          FleetPulse automatically scans every invoice for overcharges, duplicate items,
          and rate violations — so your team catches fraud in seconds, not weeks.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to={isSignedIn ? '/app/dashboard' : '/login'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl text-base hover:bg-primary/90 transition-all glow-amber"
          >
            {isSignedIn ? 'Go to dashboard' : 'Start free — no credit card'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Video demo */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 w-full max-w-3xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl shadow-black/50 bg-card">
            {/* browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary border-b border-border">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 mx-3 bg-background/60 rounded px-3 py-0.5 text-[11px] text-muted-foreground text-center">
                fleetpulse.app/app/dashboard
              </div>
            </div>
            {/* video — replace src with your YouTube embed or video URL */}
            <div className="relative aspect-video bg-background">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                title="FleetPulse product demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">2-min product walkthrough</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-6 text-xs text-muted-foreground"
        >
          Trusted by fleet operators managing 50–5,000+ vehicles
        </motion.p>
      </div>
    </section>
  )
}

function ProblemSection() {
  return (
    <section id="stats" className="py-24 px-6 bg-card/50 border-y border-border">
      <div className="max-w-5xl mx-auto">
        <FadeUp>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">The real cost of manual fleet management</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              The money leaks you can't see
            </h2>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <FadeUp delay={0.1}>
            <Stat prefix="$" suffix="k" target={184} decimals={1} label="average annual overcharges undetected per fleet" />
          </FadeUp>
          <FadeUp delay={0.2}>
            <Stat target={12} suffix=" hrs/wk" label="spent manually reviewing invoices — before FleetPulse" />
          </FadeUp>
          <FadeUp delay={0.3}>
            <Stat target={23} suffix="%" label="of fleet vehicles idle at any time, burning money daily" />
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: Upload,
      title: 'Import invoices',
      desc: 'Upload CSV, Excel, or JSON — or enter one manually. Bulk import months of history in seconds.',
    },
    {
      num: '02',
      icon: Shield,
      title: 'Anomaly scan',
      desc: 'Five detectors run instantly: rate variance, duplicate items, statistical outliers, frequency fraud, new vendor flags.',
    },
    {
      num: '03',
      icon: CheckCircle,
      title: 'Approve or dispute',
      desc: 'Review flagged invoices in context. Approve with one click or escalate. Full audit trail saved.',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Process</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              From invoice to insight in seconds
            </h2>
          </div>
        </FadeUp>

        <div className="relative">
          {/* connector line */}
          <div className="hidden lg:block absolute top-10 left-[calc(16.666%+24px)] right-[calc(16.666%+24px)] h-px bg-gradient-to-r from-border via-primary/40 to-border" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map(({ num, icon: Icon, title, desc }, i) => (
              <FadeUp key={num} delay={i * 0.12}>
                <div className="relative text-center lg:text-left">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 mb-4 relative z-10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="absolute top-0 left-0 lg:left-0 text-[80px] font-bold text-border/40 leading-none -z-0 select-none"
                    style={{ fontFamily: 'var(--font-display)' }}>
                    {num}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 relative z-10" style={{ fontFamily: 'var(--font-display)' }}>
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function DemoPreview() {
  return (
    <section className="py-16 px-6 bg-card/30 border-y border-border">
      <div className="max-w-5xl mx-auto">
        <FadeUp>
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Live product</p>
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              What you'll see in the dashboard
            </h2>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          {/* Mock dashboard preview */}
          <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-2xl shadow-black/40">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary border-b border-border">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/60" />
                <span className="h-3 w-3 rounded-full bg-amber-500/60" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 mx-3 bg-background rounded px-3 py-1 text-xs text-muted-foreground text-center">
                fleetpulse.app/dashboard
              </div>
            </div>

            {/* Fake top nav */}
            <div className="flex items-center gap-6 px-6 py-3 border-b border-border bg-background/80 text-xs">
              <div className="flex items-center gap-2">
                <Logo size={18} className="text-primary" />
                <span className="font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>FleetPulse</span>
              </div>
              {['Dashboard', 'Invoices', 'Vehicles', 'Suppliers'].map(item => (
                <span key={item} className={`text-xs ${item === 'Dashboard' ? 'text-primary' : 'text-muted-foreground'}`}>{item}</span>
              ))}
            </div>

            {/* Fake KPI row */}
            <div className="p-5 bg-background/60">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Overcharges Caught', value: '$148.3k', hi: true },
                  { label: 'Idle Cost Saved', value: '$34.7k', hi: false },
                  { label: 'Flagged Invoices', value: '37', hi: false },
                  { label: 'Avg Supplier Score', value: '72/100', hi: false },
                ].map(kpi => (
                  <div key={kpi.label} className={`rounded-lg border p-3 ${kpi.hi ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">{kpi.label}</p>
                    <p className={`text-xl font-bold font-data ${kpi.hi ? 'text-primary' : 'text-foreground'}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Fake invoice rows */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-3 py-2 bg-secondary/50 text-[9px] uppercase tracking-wider text-muted-foreground grid grid-cols-5 gap-2">
                  <span>Supplier</span><span>Vehicle</span><span>Service</span><span>Amount</span><span>Status</span>
                </div>
                {[
                  ['AutoCare Pro', 'VIN-7823', 'Oil Change', '$420', 'flagged'],
                  ['QuickFix Garage', 'VIN-4411', 'Brake Pads', '$890', 'approved'],
                  ['FleetServ Inc', 'VIN-9920', 'Tire Rotation', '$310', 'flagged'],
                  ['MechPro Services', 'VIN-5518', 'Transmission', '$2,800', 'flagged'],
                ].map(([sup, vin, svc, amt, status]) => (
                  <div key={vin} className="grid grid-cols-5 gap-2 px-3 py-2 text-[10px] border-t border-border">
                    <span className="text-foreground font-medium truncate">{sup}</span>
                    <span className="text-muted-foreground font-data">{vin}</span>
                    <span className="text-muted-foreground truncate">{svc}</span>
                    <span className="text-foreground font-data">{amt}</span>
                    <span className={`inline-flex items-center w-fit px-1.5 py-0.5 rounded text-[9px] font-medium ${
                      status === 'flagged' ? 'bg-red-500/15 text-red-400' :
                      status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                      'bg-amber-500/15 text-amber-400'
                    }`}>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Average flag rate: <span className="text-primary font-data font-semibold">14%</span> of invoices across FleetPulse customers
          </p>
        </FadeUp>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-5xl mx-auto space-y-24">
        <FadeUp>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Capabilities</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              Built for real fleet operations
            </h2>
          </div>
        </FadeUp>

        <FeatureRow
          icon={AlertTriangle}
          tag="Anomaly Detection"
          title="Five detectors running on every invoice"
          desc="Rate card variance, duplicate line items, statistical outliers (2σ), frequency fraud (same service within 7 days), and new vendor alerts. Each flag includes severity and exact reason — no black boxes."
          detail={
            <div className="space-y-2.5">
              {[
                { type: 'Rate overcharge', reason: 'Invoice 34% above contracted max of $300', sev: 'high' },
                { type: 'Duplicate line item', reason: '"Oil Filter" ($45) appears twice', sev: 'medium' },
                { type: 'Statistical outlier', reason: '2.8σ above 90-day average for Tire Rotation', sev: 'high' },
                { type: 'Frequency fraud', reason: 'Same service on VIN-7823 within 5 days', sev: 'medium' },
                { type: 'New vendor', reason: 'First invoice from BudgetAuto Repair', sev: 'low' },
              ].map(f => (
                <div key={f.type} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                  <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                    f.sev === 'high' ? 'bg-red-400' : f.sev === 'medium' ? 'bg-amber-400' : 'bg-zinc-400'
                  }`} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{f.type}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{f.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          }
        />

        <FeatureRow
          icon={Upload}
          tag="Invoice Import"
          title="Import any format, from any source"
          desc="Upload CSV exports from your fleet management system, Excel spreadsheets from accounting, or JSON feeds from supplier APIs. Batch process months of invoices instantly."
          reverse
          detail={
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 mb-4">
                <Upload className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Drop your invoice file here</p>
                <p className="text-xs text-muted-foreground">CSV, Excel (.xlsx / .xls), or JSON</p>
                <button className="mt-4 text-xs bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium">
                  Browse files
                </button>
              </div>
              <div className="flex justify-center gap-4 text-[10px] text-muted-foreground">
                {['.csv', '.xlsx', '.xls', '.json'].map(ext => (
                  <span key={ext} className="px-2 py-1 bg-secondary rounded font-data">{ext}</span>
                ))}
              </div>
            </div>
          }
        />

        <FeatureRow
          icon={Award}
          tag="Supplier Intelligence"
          title="Score every supplier on integrity, not just price"
          desc="Automatic supplier scorecarding based on flag rate, total spend, and invoice volume. Spot underperforming vendors before they cost you more."
          detail={
            <div className="space-y-3">
              {[
                { name: 'QuickFix Garage', score: 91, color: '#10b981' },
                { name: 'MechPro Services', score: 78, color: '#f59e0b' },
                { name: 'FleetServ Inc', score: 65, color: '#f59e0b' },
                { name: 'AutoCare Pro', score: 54, color: '#ef4444' },
              ].map(({ name, score, color }) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-36 shrink-0 truncate">{name}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
                  </div>
                  <span className="text-xs font-data text-foreground w-8 text-right shrink-0">{score}</span>
                </div>
              ))}
            </div>
          }
        />

        <FeatureRow
          icon={TrendingDown}
          tag="Idle Cost Tracking"
          title="Every idle day is money on the table"
          desc="Track vehicle idle events by root cause — awaiting parts, no driver, paperwork delays. Quantify the dollar cost and fix the patterns that keep repeating."
          reverse
          detail={
            <div className="grid grid-cols-2 gap-3">
              {[
                { cause: 'Awaiting Parts', days: 18, cost: '$4,320', icon: Clock },
                { cause: 'No Driver', days: 12, cost: '$2,880', icon: Truck },
                { cause: 'Paperwork', days: 8, cost: '$1,920', icon: FileText },
                { cause: 'Unknown', days: 5, cost: '$1,200', icon: AlertTriangle },
              ].map(({ cause, days, cost, icon: Icon }) => (
                <div key={cause} className="p-3 rounded-lg border border-border bg-card">
                  <Icon className="h-4 w-4 text-primary mb-2" />
                  <p className="text-xs font-semibold text-foreground">{cause}</p>
                  <p className="text-[11px] text-muted-foreground">{days} days idle</p>
                  <p className="text-base font-bold font-data text-primary mt-1">{cost}</p>
                </div>
              ))}
            </div>
          }
        />

        <FeatureRow
          icon={BarChart2}
          tag="Analytics"
          title="Spend trends that actually tell you something"
          desc="Monthly spend by service type, fleet health distributions, and supplier comparisons — all in one command center that refreshes automatically."
          detail={
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4">Spend by service type — last 6 months</p>
              <div className="space-y-3">
                {[
                  { service: 'Oil Change', pct: 28, spend: '$41.2k' },
                  { service: 'Brake Service', pct: 22, spend: '$32.4k' },
                  { service: 'Tire Rotation', pct: 18, spend: '$26.5k' },
                  { service: 'AC Repair', pct: 15, spend: '$22.1k' },
                  { service: 'Transmission', pct: 17, spend: '$25.0k' },
                ].map(({ service, pct, spend }) => (
                  <div key={service} className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground w-28 shrink-0">{service}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct * 3}%` }} />
                    </div>
                    <span className="text-[11px] font-data text-foreground w-12 text-right shrink-0">{spend}</span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section className="py-24 px-6 bg-card/30 border-y border-border">
      <FadeUp>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to stop losing money on every invoice?
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Set up takes 5 minutes. Import your existing invoices and see your first anomaly flags immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/app/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-10 py-4 rounded-xl text-lg hover:bg-primary/90 transition-all glow-amber"
            >
              Start free <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required · Free tier available · Cancel anytime</p>
        </div>
      </FadeUp>
    </section>
  )
}

function Footer() {
  const cols = [
    {
      heading: 'Product',
      links: [
        { label: 'Dashboard', to: '/app/dashboard' },
        { label: 'Invoices', to: '/app/invoices' },
        { label: 'Vehicles', to: '/app/vehicles' },
        { label: 'Suppliers', to: '/app/suppliers' },
      ],
    },
    {
      heading: 'Features',
      links: [
        { label: 'Anomaly Detection', to: '/#features' },
        { label: 'Invoice Import', to: '/#features' },
        { label: 'Supplier Scorecards', to: '/#features' },
        { label: 'Fleet Analytics', to: '/#features' },
      ],
    },
    {
      heading: 'Account',
      links: [
        { label: 'Sign in', to: '/login' },
        { label: 'Get started', to: '/login' },
        { label: 'Import invoices', to: '/app/invoices' },
        { label: 'View fleet', to: '/app/vehicles' },
      ],
    },
  ]

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <Logo size={28} className="text-primary" />
              <span className="font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>FleetPulse</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[180px]">
              Fleet spend intelligence. Catch overcharges before they hit your books.
            </p>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">{col.heading}</p>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <span>© 2026 FleetPulse. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground/50">Privacy Policy</span>
            <span className="text-muted-foreground/50">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── main export ─────────────────────────────────────────────────────── */

export default function LandingPage() {
  const scrolled = useScrolled()
  const { isSignedIn } = useClerkAuth()
  const signedIn = !!isSignedIn

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav scrolled={scrolled} isSignedIn={signedIn} />
      <Hero isSignedIn={signedIn} />
      <ProblemSection />
      <HowItWorks />
      <DemoPreview />
      <Features />
      <CtaSection />
      <Footer />
    </div>
  )
}
