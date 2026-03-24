import {defineField, defineType} from 'sanity'

export const textCta = defineType({
  name: 'textCta',
  title: 'Text + CTA',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContentTextOnly',
    }),
    defineField({
      name: 'button',
      title: 'Button',
      type: 'button',
    }),
  ],
  preview: {
    select: {
      title: 'heading',
    },
    prepare({title}) {
      return {title: title || 'Text + CTA'}
    },
  },
})
