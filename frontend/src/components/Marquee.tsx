type Props = {
  items?: string[]
  className?: string
  reverse?: boolean
}

export function Marquee({
  items = ['Angkringan Senja', 'Makanan Hangat', 'Pesan via QR', 'Buka Setiap Malam', 'Rasa Tradisi'],
  className = '',
  reverse = false,
}: Props) {
  const text = items.join('   ·   ')
  const chunk = `${text}   ·   ${text}   ·   ${text}   ·   `
  return (
    <div className={`relative overflow-hidden py-4 ${className}`} aria-label={items.join(', ')}>
      <div className={`flex w-max whitespace-nowrap text-xs font-semibold uppercase tracking-[0.35em] motion-reduce:animate-none ${reverse ? 'animate-marquee-slow [animation-direction:reverse]' : 'animate-marquee'}`}>
        <span className="px-4">{chunk}</span>
        <span className="px-4" aria-hidden="true">{chunk}</span>
      </div>
    </div>
  )
}
