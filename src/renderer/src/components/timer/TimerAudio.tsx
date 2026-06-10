import { useEffect, useRef } from 'react'
import { asset } from '../../lib/assets'
import type { TimerPhase } from '../../lib/useTimer'

const focusSrc = asset('audio/Focus.m4a')
const relaxSrc = asset('audio/Relax.m4a')

interface TimerAudioProps {
  phase: TimerPhase
  running: boolean
  soundOn: boolean
}

// Background music tied to the timer: Focus during study, Relax during breaks.
// Looping <audio> elements driven by the timer state; gated by the Sound setting.
// Playback starts only after a user gesture (the Start click), so the first play()
// is allowed by the browser's autoplay policy.
export function TimerAudio({ phase, running, soundOn }: TimerAudioProps): React.JSX.Element {
  const focusRef = useRef<HTMLAudioElement>(null)
  const relaxRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const focus = focusRef.current
    const relax = relaxRef.current
    if (!focus || !relax) return
    const active = running && soundOn ? (phase === 'focus' ? focus : relax) : null
    for (const el of [focus, relax]) {
      if (el === active) {
        if (el.paused) void el.play().catch(() => {})
      } else if (!el.paused) {
        el.pause()
      }
    }
  }, [phase, running, soundOn])

  return (
    <>
      <audio ref={focusRef} src={focusSrc} loop preload="auto" />
      <audio ref={relaxRef} src={relaxSrc} loop preload="auto" />
    </>
  )
}