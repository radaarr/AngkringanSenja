import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Marquee } from './Marquee'

const heroImages = [
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
]

export function HeroCinematic() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-[#140f0c] text-cream-50">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_15%_10%,#79543A_0%,#493323_35%,#140f0c_75%)]" />
        <div className="absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]">
          <div className="grid h-full grid-cols-3 gap-3 p-3 opacity-50 md:absolute md:right-0 md:top-0 md:h-full md:w-[45%] md:grid-cols-2 md:opacity-70">
            {heroImages.map((src, i) => (
              <div key={src} className={`overflow-hidden rounded-2xl ${i === 0 ? 'col-span-2 md:col-span-1 md:row-span-2' : ''}`}>
                <img src={src} alt="" className="h-full w-full object-cover grayscale-[20%]" loading="eager" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-soft-light [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-terracotta-500/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-brand-700/30 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pb-20 pt-28 md:pb-24 md:pt-32">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex animate-fade-up items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-terracotta-100 motion-reduce:animate-none">
            <span className="h-px w-8 bg-terracotta-100/60" aria-hidden="true" /> Angkringan Tradisional / Sejak Senja
          </p>
          <h1 className="animate-fade-up font-display text-[clamp(2.8rem,8vw,7rem)] font-bold leading-[0.95] tracking-tight text-cream-50 [animation-delay:120ms] motion-reduce:animate-none">
            Hangatnya<br />
            <span className="text-cream-100/90">Malam,</span><br />
            <span className="bg-gradient-to-r from-terracotta-500 to-[#e3a06f] bg-clip-text text-transparent">Nikmatnya</span><br />
            Kebersamaan.
          </h1>
          <p className="mt-7 max-w-xl animate-fade-up text-base leading-relaxed text-cream-100/85 [animation-delay:240ms] motion-reduce:animate-none sm:text-lg">
            Nasi kucing, sate-satean, dan wedang hangat - dipesan langsung dari meja lewat QR. Rasa tradisi, kemudahan masa kini.
          </p>
          <div className="mt-10 flex animate-fade-up flex-wrap items-center gap-4 [animation-delay:360ms] motion-reduce:animate-none">
            <Link to="/menu" className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-terracotta-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(169,93,54,0.35)] transition hover:-translate-y-0.5 hover:bg-terracotta-700 hover:shadow-[0_14px_36px_rgba(169,93,54,0.45)]">
              Pesan Sekarang <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#unggulan" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cream-50/25 bg-white/5 px-7 py-3.5 text-sm font-semibold text-cream-50 transition hover:bg-white/10">
              Jelajahi Menu
            </a>
          </div>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-cream-50/15 pt-8 animate-fade-up [animation-delay:480ms] motion-reduce:animate-none">
            {[{v:'Menu Hangat',l:'Setiap Malam'},{v:'Pesan via QR',l:'Langsung dari Meja'},{v:'Lacak Status',l:'Status Pesanan'}].map(s => (
              <div key={s.v}><div className="text-sm font-semibold text-cream-50">{s.v}</div><div className="mt-1 text-xs text-cream-100/90">{s.l}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <Marquee className="border-cream-50/10 bg-black/30" />
        <a href="#unggulan" className="absolute -top-20 left-1/2 hidden min-h-11 -translate-x-1/2 flex-col items-center justify-end gap-2 py-2 text-[10px] uppercase tracking-[0.3em] text-cream-100/90 md:flex" aria-label="Gulir ke bawah">
          <span>Gulir</span>
          <span className="flex h-10 w-6 items-start justify-center rounded-full border border-cream-50/30 p-1" aria-hidden="true"><span className="h-2 w-1 animate-bounce rounded-full bg-cream-50/80 motion-reduce:animate-none" /></span>
        </a>
      </div>
    </section>
  )
}
