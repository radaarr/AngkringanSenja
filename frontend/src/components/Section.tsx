import type { ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'

type Props = {
  id?: string
  className?: string
  innerClassName?: string
  children: ReactNode
}

export function Section({ id, className = '', innerClassName = '', children }: Props) {
  const { ref, inView } = useInView<HTMLElement>()
  return (
    <section
      id={id}
      ref={ref}
      className={`transition-all duration-700 motion-reduce:transition-none ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 motion-reduce:opacity-100 motion-reduce:translate-y-0'} ${className}`}
    >
      <div className={`mx-auto max-w-6xl px-4 ${innerClassName}`}>{children}</div>
    </section>
  )
}
