export const BlogStatus = {
  ALL: 'ALL',
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
} as const

export type BlogStatus = (typeof BlogStatus)[keyof typeof BlogStatus]
