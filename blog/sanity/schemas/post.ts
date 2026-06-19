import { defineField, defineType } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The URL of the post — auto-generated from the title. Click "Generate".',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Add a short summary — it shows on the blog card and in Google results.',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'mainImage',
      title: 'Featured image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Describe the image for screen readers and SEO.',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) =>
        rule.required().custom((img: { asset?: unknown } | undefined) => {
          if (!img?.asset) return 'Upload a picture — alt text alone is not enough'
          return true
        }),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Alternative text', type: 'string', validation: (rule: any) => rule.required() },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reviewedBy',
      title: 'Reviewed by (optional)',
      type: 'string',
      description: 'e.g. "Jane Doe, CPA/EA" — shown as the expert reviewer in Google structured data.',
    }),
    defineField({
      name: 'faq',
      title: 'FAQ (optional — for Google rich results)',
      description: 'Add questions and answers to make them eligible to show as dropdowns in Google search.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            { name: 'question', title: 'Question', type: 'string', validation: (rule: any) => rule.required() },
            { name: 'answer', title: 'Answer', type: 'text', rows: 3, validation: (rule: any) => rule.required() },
          ],
          preview: { select: { title: 'question' } },
        },
      ],
    }),
    defineField({
      name: 'howTo',
      title: 'How-to steps (optional — for Google rich results)',
      description: 'Fill this only if the article is a step-by-step guide.',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'name', title: 'How-to title', type: 'string' },
        { name: 'totalTime', title: 'Total time (ISO 8601, e.g. P6W = 6 weeks)', type: 'string' },
        { name: 'costMin', title: 'Estimated cost — min (USD)', type: 'number' },
        { name: 'costMax', title: 'Estimated cost — max (USD)', type: 'number' },
        {
          name: 'steps',
          title: 'Steps',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'howToStep',
              fields: [
                { name: 'name', title: 'Step name', type: 'string', validation: (rule: any) => rule.required() },
                { name: 'text', title: 'Step description', type: 'text', rows: 2, validation: (rule: any) => rule.required() },
              ],
              preview: { select: { title: 'name' } },
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO (optional)',
      type: 'seo',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'mainImage', subtitle: 'category.title' },
  },
  orderings: [
    {
      title: 'Published date, newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
})
