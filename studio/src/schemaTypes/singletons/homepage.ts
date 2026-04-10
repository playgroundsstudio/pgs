import {HomeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'showreel',
      title: 'Showreel',
      type: 'mux.video',
      description: 'A single showreel video displayed on the homepage.',
    }),
    defineField({
      name: 'projectList',
      title: 'Project List',
      type: 'array',
      description: 'Ordered list of projects shown in the homepage projects list.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}],
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Homepage',
      }
    },
  },
})
