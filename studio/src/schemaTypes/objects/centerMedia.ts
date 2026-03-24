import {defineField, defineType} from 'sanity'

export const centerMedia = defineType({
  name: 'centerMedia',
  title: 'Center Media',
  type: 'object',
  fields: [
    defineField({
      name: 'media',
      title: 'Media',
      type: 'mediaItem',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Center Media'}
    },
  },
})
