// The only module that imports Remotion — loaded lazily so the Player bundle
// never touches first paint. Split from Widgets.tsx on purpose.
import { Player, type PlayerRef } from '@remotion/player'
import { useEffect, useRef } from 'react'
import { RenewalTimeline, TIMELINE_DURATION, NumberStory, NUMBERSTORY_DURATION, TatkaalExplainer, EXPLAINER_DURATION, type NumberStoryProps } from './compositions'
import type { Plan } from './constants'

const COMMON = { compositionWidth: 1280, compositionHeight: 720, fps: 30 }

export function RenewalPlayer({ plan, onEnded }: { plan: Plan; onEnded: () => void }) {
  const ref = useRef<PlayerRef>(null)
  useEffect(() => {
    const p = ref.current
    if (!p) return
    p.addEventListener('ended', onEnded)
    return () => p.removeEventListener('ended', onEnded)
  }, [onEnded])
  return (
    <Player
      ref={ref}
      component={RenewalTimeline as never}
      inputProps={{ plan } as never}
      durationInFrames={TIMELINE_DURATION}
      {...COMMON}
      style={{ width: '100%', height: '100%' }}
      autoPlay
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
    p.addEventListener('ended', onEnded)
    return () => p.removeEventListener('ended', onEnded)
  }, [onEnded])
  return (
    <Player
      ref={ref}
      component={NumberStory as never}
      inputProps={props as never}
      durationInFrames={NUMBERSTORY_DURATION}
      {...COMMON}
      style={{ width: '100%', height: '100%' }}
      autoPlay
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
      compositionWidth={1280}
      compositionHeight={680}
      fps={30}
      style={{ width: '100%', height: '100%' }}
      acknowledgeRemotionLicense
    />
  )
}
