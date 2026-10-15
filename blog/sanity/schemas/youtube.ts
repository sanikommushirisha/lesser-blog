import { createElement } from 'react'
import { defineField, defineType } from 'sanity'
import { parseYouTubeUrl, youTubeThumbnails } from '../../src/lib/youtube'

/** Shared rule: the link must be a single YouTube video the site can play. */
export function validateYouTubeUrl(value: string | undefined): true | string {
  if (!value) return true
  return parseYouTubeUrl(value)
    ? true
    : 'Paste a link to one YouTube video, e.g. https://youtu.be/VIDEO_ID or https://www.youtube.com/watch?v=VIDEO_ID'
}

/** Studio list preview: the video's own thumbnail. */
function thumbnail(url: string | undefined) {
  const ref = parseYouTubeUrl(url)
  if (!ref) return undefined
  const src = youTubeThumbnails(ref.id)[2] // hqdefault always exists
  return createElement('img', { src, alt: '', style: { objectFit: 'cover', width: '100%', height: '100%' } })
}

/** A YouTube video placed inside the article body, wherever an image could go. */
export const youtube = defineType({
  name: 'youtube',
  title: 'YouTube video',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'YouTube link',
      type: 'url',
      description: 'Paste the link from YouTube\'s Share button. A link with ?t= starts the video at that time.',
      validation: (rule) => rule.required().custom(validateYouTubeUrl),
    }),
    defineField({
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
    }),
  ],
  preview: {
    select: { url: 'url', caption: 'caption' },
    prepare: ({ url, caption }: { url?: string; caption?: string }) => ({
      title: caption || 'YouTube video',
      subtitle: url,
      media: thumbnail(url),
    }),
  },
})
