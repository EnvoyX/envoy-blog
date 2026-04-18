import z from 'zod'

export const postSchema = z.object({
  title: z.string('Title is required').min(5, 'Title is 5 characters minimum'),
  description: z
    .string('Description is required')
    .min(10, 'Description is 10 characters minimum'),
  image: z.string().min(1, 'Image Link is required'),
  content: z.string().min(1, 'Content is required'),
  published: z.boolean({
    error: 'Published status is required',
  }),
})

export const postSearchSchema = z.object({
  visibility: z.enum(['ALL', 'PUBLIC', 'PRIVATE']).default('PUBLIC'),
  query: z.string().default(''),
})
