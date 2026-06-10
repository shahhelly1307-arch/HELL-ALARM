import { useEffect, useState } from 'react'
import { asset, modeDir } from '../../lib/assets'

// Frame sequences (full-frame 512x512 exports, art baked at the cat's head).
const FRAME_MS = 450
// Hearts are theme-specific; the sleeping "z"s are shared across themes.
const heartFrames = (dark: boolean): string[] =>
  [1, 2, 3].map((n) =>
    asset(encodeURI(`animations/${modeDir(dark)}/heart-animation/heart-animation - ${n}.png`))
  )
const sleepFrames = [1, 2, 3].map((n) =>
  asset(encodeURI(`animations/sleeping-animation/sleeping-animation - ${n}.png`))
)

// Cat mood: hearts rising while focusing (running), sleepy "z"s while idle/paused.
export function TimerEmote({
  running,
  dark
}: {
  running: boolean
  dark: boolean
}): React.JSX.Element {
  const frames = running ? heartFrames(dark) : sleepFrames
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    setFrame(0)
    const id = setInterval(() => setFrame((f) => (f + 1) % frames.length), FRAME_MS)
    return () => clearInterval(id)
  }, [running, frames.length])

  return <img className="canvas-layer" src={frames[frame]} alt="" />
}