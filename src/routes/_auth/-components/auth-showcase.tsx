import { cn } from 'cn'
import {
  BarChart3Icon,
  BellIcon,
  CloudIcon,
  FingerprintIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LockIcon,
  MailIcon,
  PieChartIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  TrendingUpIcon,
  UsersIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'

type Slide = {
  title: string
  description: string
  icon: LucideIcon
  orbit: [LucideIcon, LucideIcon, LucideIcon, LucideIcon, LucideIcon]
}

const SLIDES: Slide[] = [
  {
    title: 'Secure by default',
    description:
      'Session-backed authentication with automatic token refresh keeps your account protected without getting in your way.',
    icon: ShieldCheckIcon,
    orbit: [LockIcon, KeyRoundIcon, FingerprintIcon, SmartphoneIcon, MailIcon],
  },
  {
    title: 'Everything in one place',
    description:
      'Manage users, data and settings from a single dashboard built for speed and clarity.',
    icon: LayoutDashboardIcon,
    orbit: [UsersIcon, BellIcon, CloudIcon, MailIcon, LockIcon],
  },
  {
    title: 'Insights at a glance',
    description:
      'Track the numbers that matter with real-time charts and reports, on any device.',
    icon: BarChart3Icon,
    orbit: [PieChartIcon, TrendingUpIcon, UsersIcon, BellIcon, CloudIcon],
  },
]

const AUTO_ADVANCE_MS = 6000

// Positions (in % of the illustration box) for the floating icon bubbles.
const ORBIT_POSITIONS = [
  'left-[8%] top-[42%] size-12',
  'left-[14%] top-[12%] size-11',
  'left-[42%] top-0 size-12',
  'right-[16%] top-[6%] size-12',
  'right-[6%] top-[34%] size-11',
]

export function AuthShowcase() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % SLIDES.length),
      AUTO_ADVANCE_MS,
    )
    return () => window.clearInterval(id)
  }, [paused])

  const slide = SLIDES[active]

  return (
    <div
      className="flex w-full flex-col items-center justify-center text-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        key={active}
        className="flex flex-col items-center animate-in fade-in duration-500"
        aria-live="polite"
      >
        <Illustration slide={slide} />

        <h2 className="mt-10 text-xl font-bold">{slide.title}</h2>
        <p className="mt-4 max-w-[400px] text-base leading-relaxed text-foreground/80">
          {slide.description}
        </p>
      </div>

      <div className="mt-10 flex items-center gap-1.5" role="tablist">
        {SLIDES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Show slide ${i + 1}: ${s.title}`}
            onClick={() => setActive(i)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === active
                ? 'w-6 bg-primary'
                : 'w-1.5 bg-primary/25 hover:bg-primary/50',
            )}
          />
        ))}
      </div>
    </div>
  )
}

function Illustration({ slide }: { slide: Slide }) {
  const Center = slide.icon

  return (
    <div className="relative h-[270px] w-full max-w-[340px]">
      {/* cloud backdrop */}
      <div className="absolute inset-x-[6%] bottom-0 h-[62%] rounded-[48%_52%_40%_44%/60%_60%_40%_40%] bg-muted" />
      <div className="absolute left-[22%] bottom-[38%] size-28 rounded-full bg-muted" />
      <div className="absolute right-[18%] bottom-[34%] size-32 rounded-full bg-muted" />

      {/* device */}
      <div className="absolute bottom-0 left-1/2 flex h-[62%] w-[34%] -translate-x-1/2 flex-col items-center justify-center rounded-t-xl bg-primary text-primary-foreground shadow-lg">
        <div className="absolute top-3 h-1 w-8 rounded-full bg-primary-foreground/40" />
        <Center className="size-12" strokeWidth={1.5} />
      </div>

      {/* floating card */}
      <div className="absolute bottom-[22%] right-[2%] w-[38%] rounded-md bg-card p-2.5 text-left shadow-md">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-primary/70" />
          <span className="text-xs font-semibold tracking-widest text-foreground/70">
            ******
          </span>
        </div>
        <div className="mb-1.5 h-1.5 w-full rounded-full bg-muted" />
        <div className="h-1.5 w-3/4 rounded-full bg-muted" />
      </div>

      {/* orbiting bubbles */}
      {slide.orbit.map((Icon, i) => (
        <span
          key={i}
          className={cn(
            'absolute flex items-center justify-center rounded-full bg-primary/85 text-primary-foreground shadow-md ring-4 ring-card',
            ORBIT_POSITIONS[i],
          )}
        >
          <Icon className="size-5" />
        </span>
      ))}
    </div>
  )
}
