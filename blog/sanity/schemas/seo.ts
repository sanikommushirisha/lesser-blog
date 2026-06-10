import { defineField, defineType } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      description: 'Overrides the post title in search results. Leave blank to use the post title.',
      validation: (rule) => rule.max(60).warning('Keep under 60 characters for Google.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 2,
      description: 'Leave blank to use the excerpt.',
      validation: (rule) => rule.max(160).warning('Keep under 160 characters for Google.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description: 'Leave blank to use the featured image.',
    }),
  ],
})
