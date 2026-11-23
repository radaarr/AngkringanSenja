import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { orderApi } from '@/services/orderApi'
import { useCartStore } from '@/stores/cartStore'

export function useTableFromUrl() {
  const [params, setParams] = useSearchParams()
  const setTable = useCartStore(s => s.setTable)
  const handled = useRef(false)
  const tableParam = params.get('table')

  useEffect(() => {
    if (!tableParam || handled.current) return
    handled.current = true
    orderApi.resolveTable(tableParam)
      .then(t => {
        setTable(t.qr_token, t.name)
        params.delete('table')
        setParams(params, { replace: true })
      })
      .catch(() => {
        params.delete('table')
        setParams(params, { replace: true })
      })
  }, [tableParam, params, setParams, setTable])
}
