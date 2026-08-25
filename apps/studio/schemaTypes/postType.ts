import { defineArrayMember, defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Post",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "Metadata" },
    { name: "seo", title: "SEO & Social" },
    { name: "visibility", title: "Visibility" },
  ],
  fields: [
    // content group
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: {
        source: "title",
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt / Summary",
      type: "text",
      rows: 3,
      group: "content",
      description: "Short summary used for post previews and meta descriptions.",
      validation: (rule) =>
        rule.max(200).warning("Keep excerpts under 200 characters for optimal search previews."),
    }),
    defineField({
      name: "mainImage",
      title: "Main Image / Cover",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
          description: "Crucial for accessibility and SEO.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      group: "content",
      of: [
        // Standard rich text blocks
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (rule) =>
                      rule.uri({
                        scheme: ["http", "https", "mailto", "tel"],
                        allowRelative: true,
                      }),
                  },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative Text",
              validation: (rule) => rule.required(),
            },
            {
              name: "caption",
              type: "string",
              title: "Caption",
            },
          ],
        }),
        defineArrayMember({
          type: "code",
          title: "Code Block",
          options: {
            withFilename: true,
          },
        }),
      ],
    }),

    // metadata group
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      group: "meta",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "meta",
      of: [defineArrayMember({ type: "reference", to: [{ type: "category" }] })],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "meta",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      group: "meta",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "readingTime",
      title: "Estimated Reading Time (minutes)",
      type: "number",
      group: "meta",
      validation: (rule) => rule.min(1),
    }),

    // seo group
    defineField({
      name: "seo",
      title: "SEO Settings",
      type: "object",
      group: "seo",
      fields: [
        defineField({
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
          description: "Overrides the post title for <title> tags (max 60 chars).",
          validation: (rule) => rule.max(60),
        }),
        defineField({
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 2,
          description: "Overrides the excerpt for meta description (max 160 chars).",
          validation: (rule) => rule.max(160),
        }),
        defineField({
          name: "ogImage",
          title: "Open Graph Image",
          type: "image",
          description: "Custom social share card image (defaults to Main Image if omitted).",
        }),
      ],
    }),

    // visibility group
    defineField({
      name: "visibility",
      title: "Visibility",
      type: "string",
      group: "visibility",
      options: {
        list: [
          { title: "Public", value: "public" },
          { title: "Private (Unlisted / Admin only)", value: "private" },
        ],
        layout: "radio",
      },
      initialValue: "public",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "mainImage",
      date: "publishedAt",
      visibility: "visibility",
    },
    prepare({ title, author, media, date, visibility }) {
      const formattedDate = date ? new Date(date).toLocaleDateString() : "Draft";
      const isPrivate = visibility === "private";
      return {
        title,
        subtitle: `${isPrivate ? "[PRIVATE] " : ""}${author ? `By ${author} • ` : ""}${formattedDate}`,
        media,
      };
    },
  },
});
