// Dedicated video watch pages (/videos/:slug) content — kept separate from
// WatchPage.tsx so that file only exports the component (Fast Refresh).
export interface WatchVideo {
  slug: string
  title: string
  description: string
  duration: string // ISO 8601
  durationLabel: string
  uploadDate: string
  mp4: string
  poster: string
  relatedPost: { slug: string; title: string }
  transcript: { heading: string; lines: string[] }[]
}

export const VIDEOS: WatchVideo[] = [
  {
    slug: 'tatkaal-from-the-us-in-45-seconds',
    title: 'Tatkaal from the US, day by day',
    description:
      'The urgent Indian passport re-issue route from the USA in under a minute: what Tatkaal actually expedites, the 5-working-day consulate leg, and the $271 all-in total for a 36-page booklet.',
    duration: 'PT16S',
    durationLabel: '0:16',
    uploadDate: '2026-07-12',
    mp4: '/videos/tatkaal-explainer.mp4',
    poster: '/videos/tatkaal-explainer-poster.png',
    relatedPost: { slug: 'tatkaal-passport-renewal-usa-eligibility', title: 'Tatkaal eligibility from the US: the complete guide' },
    transcript: [
      {
        heading: 'What the video covers',
        lines: [
          'Day 0: the Passport Seva form, with Tatkaal selected. The form is the same as the normal route; the queue changes, not the paperwork. Forms expire after 180 days.',
          'Days 2-4: your packet lands at VFS Global. This is where applications go on hold — wrong jurisdiction or a stale photo spec stops the file before the consulate ever sees it.',
          'Days 5-11: the consulate prints in 5 working days, if your police verification record is clear. Only this leg is expedited.',
          'Days 12-15: courier back. About 2 to 3 weeks door to door, versus roughly 8 weeks on the normal route.',
          'Cost: the Tatkaal surcharge is a flat $125 on top of the base fees — $125 government fee + $2 ICWF + $19 VFS service fee, so a 36-page booklet lands at $271 all-in ($321 for the 60-page jumbo).',
        ],
      },
    ],
  },
]
