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
      name: 'servicesStatement',
      title: 'Services Statement',
      type: 'text',
      rows: 3,
      description: 'A short statement displayed alongside the services list.',
    }),
    defineField({
      name: 'industryStatement',
      title: 'Sectors Statement',
      type: 'text',
      rows: 3,
      description: 'A short statement displayed alongside the sectors list.',
    }),
    defineField({
      name: 'actionsStatement',
      title: 'Actions Statement',
      type: 'text',
      rows: 3,
      description: 'A short statement displayed alongside the actions list.',
    }),
    defineField({
      name: 'enquiryTabImage',
      title: 'Enquiry Tab Image',
      type: 'image',
      description: 'Thumbnail shown on the navigation tab for the enquiry form.',
      options: {hotspot: true},
    }),
    defineField({
      name: 'newsletterTabImage',
      title: 'Newsletter Tab Image',
      type: 'image',
      description: 'Thumbnail shown on the navigation tab for the newsletter form.',
      options: {hotspot: true},
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
