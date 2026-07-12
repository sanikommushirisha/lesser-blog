import { registerRoot, Composition } from 'remotion'
import React from 'react'
import {
  TatkaalExplainer,
  EXPLAINER_DURATION,
  NumberStory,
  NUMBERSTORY_DURATION,
  RenewalTimeline,
  TIMELINE_DURATION,
} from '../src/motion/compositions'
import { computePlan } from '../src/motion/constants'

// Sample plan for the Studio preview; the render script overrides via inputProps.
const samplePlan = computePlan({ consulate: 'new-york', caseType: 'normal', booklet: '36' })

const Root: React.FC = () =>
  React.createElement(React.Fragment, null,
    React.createElement(Composition, {
      id: 'tatkaal-explainer', component: TatkaalExplainer,
      durationInFrames: EXPLAINER_DURATION, fps: 30, width: 1280, height: 680,
    }),
    React.createElement(Composition, {
      id: 'numberstory', component: NumberStory as never,
      durationInFrames: NUMBERSTORY_DURATION, fps: 30, width: 1280, height: 720,
      defaultProps: { kicker: 'One threshold, all accounts', big: '$10,000', answer: 'Combined across ALL non-US accounts, any single day of the year.' },
    }),
    // Landscape 16:9 — in-post player / preview.
    React.createElement(Composition, {
      id: 'renewal-timeline', component: RenewalTimeline as never,
      durationInFrames: TIMELINE_DURATION, fps: 30, width: 1280, height: 720,
      defaultProps: { plan: samplePlan },
    }),
    // Portrait 9:16 — the WhatsApp share MP4 the render script produces.
    React.createElement(Composition, {
      id: 'renewal-timeline-portrait', component: RenewalTimeline as never,
      durationInFrames: TIMELINE_DURATION, fps: 30, width: 1080, height: 1920,
      defaultProps: { plan: samplePlan },
    })
  )
registerRoot(Root)
