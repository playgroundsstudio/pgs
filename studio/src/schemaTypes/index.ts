import {person} from './documents/person'
import {page} from './documents/page'
import {project} from './documents/project'
import {tag} from './documents/tag'
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {aboutPgs} from './singletons/aboutPgs'
import {homepage} from './singletons/homepage'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'
import {mediaItem} from './objects/mediaItem'
import {sideBySideMedia} from './objects/sideBySideMedia'
import {centerMedia} from './objects/centerMedia'
import {textCta} from './objects/textCta'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  aboutPgs,
  homepage,
  // Documents
  page,
  project,
  tag,
  person,
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  infoSection,
  callToAction,
  link,
  mediaItem,
  sideBySideMedia,
  centerMedia,
  textCta,
]
