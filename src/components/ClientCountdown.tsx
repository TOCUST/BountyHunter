'use client'
import { useEffect, useState } from 'react'

export default function ClientCountdown({ endsAt }: { endsAt: string }) {
  const end = new Date(endsAt).getTime()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const remain = Math.max(0, end - now)
  const h = Math.floor(remain / 3600000)
  const m = Math.floor((remain % 3600000) / 60000)
  const s = Math.floor((remain % 60000) / 1000)
  return <span>{h}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</span>
}


