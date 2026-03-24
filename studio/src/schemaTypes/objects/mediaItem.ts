import {defineField, defineType} from 'sanity'

export const mediaItem = defineType({
  name: 'mediaItem',
  title: 'Media Item',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          {title: 'Image', value: 'image'},
          {title: 'Video', value: 'video'},
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
        },
      ],
      hidden: ({parent}) => parent?.mediaType === 'video',
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'mux.video',
      hidden: ({parent}) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      options: {
        list: [
          {title: '1:1', value: '1/1'},
          {title: '4:3', value: '4/3'},
          {title: '3:2', value: '3/2'},
          {title: '16:9', value: '16/9'},
          {title: '9:16', value: '9/16'},
          {title: '4:5', value: '4/5'},
          {title: '2:3', value: '2/3'},
          {title: 'Free', value: 'free'},
        ],
      },
      initialValue: 'free',
    }),
  ],
})
