'use client'
import { useEffect, useState } from 'react'

function Countdown({ endsAt }: { endsAt: string }) {
  const end = new Date(endsAt).getTime()
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  const remain = Math.max(0, end - now)
  const d = Math.floor(remain / 86400000)
  const h = Math.floor((remain % 86400000) / 3600000)
  const m = Math.floor((remain % 3600000) / 60000)
  const s = Math.floor((remain % 60000) / 1000)
  return <div className="text-3xl font-bold">{d}d {h}h {m}m {s}s</div>
}

export default function LaunchPage() {
  const [launchAt, setLaunchAt] = useState<string>('')
  useEffect(() => { fetch('/api/launch').then(r => r.json()).then(d => setLaunchAt(d.launchAt)) }, [])
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-semibold">即将开服 · 곧 시작합니다 · Launching Soon</h1>
      {launchAt && <Countdown endsAt={launchAt} />}
      <p className="opacity-80">现在注册并获取邀请奖励，开服后优先体验</p>
    </main>
  )
}


