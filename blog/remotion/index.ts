import { registerRoot, Composition } from 'remotion'
import React from 'react'
import { TatkaalExplainer, EXPLAINER_DURATION, NumberStory, NUMBERSTORY_DURATION } from '../src/motion/compositions'

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
    })
  )
registerRoot(Root)
