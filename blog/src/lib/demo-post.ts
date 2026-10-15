import type { Post } from './sanity'

/**
 * LOCAL DEVELOPMENT ONLY: a fake video post for testing the featured-video
 * layout (card play icon, video thumbnail, floating mini player) without
 * touching Sanity.
 *
 * It is exactly the object `fetchPost` returns from Sanity for a post with a
 * YouTube link: same fields, a portable-text body, and real image asset
 * references from the production dataset (so images load from Sanity's CDN).
 *
 * src/lib/sanity.ts only adds it when `import.meta.env.DEV` is true, i.e. under
 * `npm run dev:blog`. Production builds (and the prerender) drop it entirely.
 */

export const DEMO_SLUG = 'demo-video-post'

let key = 0
const k = () => `demo${(key++).toString(36).padStart(6, '0')}`

const span = (text: string, marks: string[] = []) => ({ _key: k(), _type: 'span', marks, text })
const block = (style: string, text: string) => ({
  _key: k(),
  _type: 'block',
  style,
  markDefs: [],
  children: [span(text)],
})
const bullet = (text: string) => ({ ...block('normal', text), listItem: 'bullet', level: 1 })

const filler =
  'This paragraph is filler so the article is long enough to scroll. Keep scrolling past the video and watch it ' +
  'shrink into the card above "Recent blogs", then scroll back up and watch it grow back into place. ' +
  'The video should keep playing the whole time without restarting.'

const body = [
  {
    _key: k(),
    _type: 'block',
    style: 'blockquote',
    markDefs: [],
    children: [
      span('Quick answer:', ['strong']),
      span(
        ' This is a local-only demo post for testing the featured YouTube video. It never appears on lesser.tax. ' +
          'Play the video, scroll down, and check that it floats, keeps playing, and closes cleanly.'
      ),
    ],
  },
  block('h2', 'Key takeaways'),
  bullet('On /blog, this card shows the video thumbnail with a white play icon.'),
  bullet('On this page, the video sits where the featured image normally is, with our thumbnail as its cover.'),
  bullet('Scrolling past it turns it into a mini player docked above "Recent blogs" (bottom-right on phones).'),
  bullet('The close button pauses the video; scrolling back up to it resets that.'),
  ...['What to check first', 'Scrolling past the video', 'Coming back up', 'Closing the mini player', 'On a phone', 'Reduced motion']
    .flatMap((h) => [block('h2', h), block('normal', filler), block('normal', filler)]),
]

const wordCount = body
  .flatMap((b) => b.children.map((c) => c.text))
  .join(' ')
  .split(' ').length

export const DEMO_POST: Post = {
  _id: 'demo-video-post',
  title: 'Demo: featured video post (local testing only)',
  slug: DEMO_SLUG,
  excerpt: 'A local-only post for testing the featured YouTube video, its thumbnail and the floating mini player.',
  mainImage: {
    _type: 'image',
    alt: 'Indian passport with a US address label and VFS Global envelope',
    asset: { _ref: 'image-67ced88c85ece1c542a387387ff07041ffb29172-1200x630-png', _type: 'reference' },
  },
  // Exactly as an editor would paste it from the browser's address bar.
  featuredVideo: 'https://www.youtube.com/watch?v=LGLS4ARe-vw&list=RDLGLS4ARe-vw&start_radio=1',
  videoThumbnail: {
    _type: 'image',
    alt: 'Form 5472 guide cover',
    asset: { _ref: 'image-f1c93a7b2013481debefb1987e17f5f6df7bb8b8-1200x630-png', _type: 'reference' },
  },
  publishedAt: new Date().toISOString(),
  _updatedAt: new Date().toISOString(),
  category: { title: 'Tax Planning', slug: 'tax-planning' },
  author: {
    name: 'Lesser Tax',
    avatar: {
      _type: 'image',
      asset: { _ref: 'image-6a8f31f68882bf161637f8fde988fd2b0a9d2fcb-2084x2084-png', _type: 'reference' },
    },
  },
  wordCount,
  body: body as Post['body'],
}
