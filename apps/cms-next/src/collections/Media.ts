import path from 'path'
import { fileURLToPath } from 'url'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'externalURL',
      type: 'text',
      label: 'External Image URL',
      admin: {
        description: 'Paste a remote image URL directly (e.g. from Twitter/CDN/Unsplash).',
      },
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    // Disable required file upload so documents can be saved with only externalURL
    filesRequiredOnCreate: false,
    // Provide a custom thumbnail resolver for external URLs in Admin UI
    adminThumbnail: ({ doc }) => {
      if (typeof doc?.externalURL === 'string' && doc.externalURL.length > 0) {
        return doc.externalURL
      }
      return (
        (doc?.sizes as Record<string, { url?: string }> | undefined)?.thumbnail?.url ||
        (doc?.url as string) ||
        null
      )
    },
    focalPoint: true,
    // imageSizes: [
    //   {
    //     name: 'thumbnail',
    //     width: 300,
    //   },
    //   {
    //     name: 'square',
    //     width: 500,
    //     height: 500,
    //   },
    //   {
    //     name: 'small',
    //     width: 600,
    //   },
    //   {
    //     name: 'medium',
    //     width: 900,
    //   },
    //   {
    //     name: 'large',
    //     width: 1400,
    //   },
    //   {
    //     name: 'xlarge',
    //     width: 1920,
    //   },
    //   {
    //     name: 'og',
    //     width: 1200,
    //     height: 630,
    //     crop: 'center',
    //   },
    // ],
  },
}
