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
    defineField({
      name: 'width',
      title: 'Width',
      type: 'string',
      options: {
        list: [
          {title: '75%', value: '75'},
          {title: '50%', value: '50'},
        ],
      },
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Center Media'}
    },
  },
})
