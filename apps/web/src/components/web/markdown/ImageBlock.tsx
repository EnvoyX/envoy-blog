// Custom Image Component
export function MarkdownImage({ src, alt }: { src?: string; alt?: string }) {
  return (
    <figure className="my-10 flex flex-col items-center ">
      <div className="rounded-2xl shadow-2xl">
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto object-cover  transition-transform duration-500 rounded-2xl"
        />
        {alt && (
          <figcaption className="text-sm italic text-zinc-500 text-center px-4 -mt-6">
            {alt}
          </figcaption>
        )}
      </div>
      {/* <img
        src={src}
        alt={alt}
        className="max-w-full h-auto object-cover hover:scale-105 transition-transform duration-500 rounded-2xl"
      /> */}
      {/* {alt && (
        <figcaption className="text-sm italic text-zinc-500 text-center px-4">
          {alt}
        </figcaption>
      )} */}
    </figure>
  )
}
