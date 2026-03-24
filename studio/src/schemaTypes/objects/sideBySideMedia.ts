import {defineField, defineType} from 'sanity'

export const sideBySideMedia = defineType({
  name: 'sideBySideMedia',
  title: 'Side by Side Media',
  type: 'object',
  fields: [
    defineField({
      name: 'leftMedia',
      title: 'Left Media',
      type: 'mediaItem',
    }),
    defineField({
      name: 'rightMedia',
      title: 'Right Media',
      type: 'mediaItem',
    }),
    defineField({
      name: 'highlighted',
      title: 'Highlighted',
      type: 'string',
      initialValue: 'neither',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Right', value: 'right'},
          {title: 'Neither', value: 'neither'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Side by Side Media'}
    },
  },
})
