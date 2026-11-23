import { Link } from 'react-router-dom'
import { MapPin, Clock, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-brand-900 text-cream-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl font-bold text-cream-50">Angkringan Senja</div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-cream-100/85">Rasa tradisi, kemudahan masa kini. Nikmati nasi kucing, sate-satean, dan minuman hangat favorit - pesan langsung dari meja atau bawa pulang.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-cream-50">Menu</h3>
          <ul className="mt-2 space-y-0.5 text-sm text-cream-100/85">
            <li><Link to="/" className="inline-flex min-h-11 items-center hover:text-cream-50">Beranda</Link></li>
            <li><Link to="/menu" className="inline-flex min-h-11 items-center hover:text-cream-50">Lihat Menu</Link></li>
            <li><Link to="/cart" className="inline-flex min-h-11 items-center hover:text-cream-50">Keranjang</Link></li>
            <li><Link to="/login" className="inline-flex min-h-11 items-center hover:text-cream-50">Masuk Staf</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-cream-50">Informasi</h3>
          <ul className="mt-4 space-y-3 text-sm text-cream-100/85">
            <li className="flex items-start gap-2"><Clock size={16} className="mt-0.5 shrink-0 text-terracotta-100" aria-hidden="true" /><span>Jam operasional<br/>Lihat informasi di lokasi</span></li>
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-terracotta-100" aria-hidden="true" /><span>Lokasi<br/>Tanya kasir atau scan QR meja</span></li>
            <li className="flex items-start gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-terracotta-100" aria-hidden="true" /><span>Kontak<br/>Tersedia di lokasi</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-50/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-cream-100/85 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Angkringan Senja. Semua hak dilindungi.</p>
          <p>Hangatnya malam, nikmatnya kebersamaan.</p>
        </div>
      </div>
    </footer>
  )
}
