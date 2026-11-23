import type { ReactNode } from 'react'

type Props = {
  eyebrow?: string
  title: string
  description?: string
  right?: ReactNode
  children?: ReactNode
}

export function PageHero({ eyebrow, title, description, right, children }: Props) {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(1100px_520px_at_15%_0%,#79543A_0%,#493323_38%,#1b1411_100%)] pb-14 pt-28 text-cream-50 md:pb-20 md:pt-32">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-terracotta-500/20 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl items-end gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-100">{eyebrow}</p>}
          <h1 className="mt-3 font-display text-5xl font-bold leading-[1.05] md:text-7xl">{title}</h1>
          {description && <p className="mt-5 max-w-xl text-base leading-relaxed text-cream-100/90 md:text-lg">{description}</p>}
        </div>
        {right && <div className="lg:justify-self-end">{right}</div>}
      </div>
      {children && <div className="relative mx-auto mt-8 max-w-6xl px-4">{children}</div>}
    </section>
  )
}
