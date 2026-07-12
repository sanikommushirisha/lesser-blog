// The only module that imports Remotion — loaded lazily so the Player bundle
// never touches first paint. Split from Widgets.tsx on purpose.
import { Player, type PlayerRef } from '@remotion/player'
import { useEffect, useRef } from 'react'
import { RenewalTimeline, TIMELINE_DURATION, NumberStory, NUMBERSTORY_DURATION, TatkaalExplainer, EXPLAINER_DURATION, type NumberStoryProps } from './compositions'
import type { Plan } from './constants'

import { isNarrow, reducedMotion } from './viewport'

const LANDSCAPE = { compositionWidth: 1280, compositionHeight: 720 }
const PORTRAIT = { compositionWidth: 720, compositionHeight: 900 }
const dims = () => (isNarrow() ? PORTRAIT : LANDSCAPE)

export function RenewalPlayer({ plan, onEnded }: { plan: Plan; onEnded: () => void }) {
  const ref = useRef<PlayerRef>(null)
  useEffect(() => {
    const p = ref.current
    if (!p) return
    const handle = () => {
      // freeze on the end card instead of resetting to a blank first frame
      p.seekTo(TIMELINE_DURATION - 1)
      onEnded()
    }
    p.addEventListener('ended', handle)
    return () => p.removeEventListener('ended', handle)
  }, [onEnded])
  return (
    <Player
      ref={ref}
      component={RenewalTimeline as never}
      inputProps={{ plan } as never}
      durationInFrames={TIMELINE_DURATION}
      {...dims()}
      fps={30}
      style={{ width: '100%', height: '100%' }}
      autoPlay={!reducedMotion()}
      controls
      acknowledgeRemotionLicense
    />
  )
}

export function StoryPlayer({ props, onEnded }: { props: NumberStoryProps; onEnded: () => void }) {
  const ref = useRef<PlayerRef>(null)
  useEffect(() => {
    const p = ref.current
    if (!p) return
    const handle = () => {
      p.seekTo(NUMBERSTORY_DURATION - 1)
      onEnded()
    }
    p.addEventListener('ended', handle)
    return () => p.removeEventListener('ended', handle)
  }, [onEnded])
  return (
    <Player
      ref={ref}
      component={NumberStory as never}
      inputProps={props as never}
      durationInFrames={NUMBERSTORY_DURATION}
      {...dims()}
      fps={30}
      style={{ width: '100%', height: '100%' }}
      autoPlay={!reducedMotion()}
      controls
      acknowledgeRemotionLicense
    />
  )
}

export function ScrollExplainerPlayer({ progress }: { progress: number }) {
  const ref = useRef<PlayerRef>(null)
  useEffect(() => {
    ref.current?.seekTo(Math.round(progress * (EXPLAINER_DURATION - 1)))
  }, [progress])
  return (
    <Player
      ref={ref}
      component={TatkaalExplainer}
      durationInFrames={EXPLAINER_DURATION}
      compositionWidth={isNarrow() ? 720 : 1280}
      compositionHeight={isNarrow() ? 700 : 680}
      fps={30}
      style={{ width: '100%', height: '100%' }}
      acknowledgeRemotionLicense
    />
  )
}
