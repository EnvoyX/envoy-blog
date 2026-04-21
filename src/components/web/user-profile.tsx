import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function UserAvatar({
  src,
  alt,
  className,
  classNameImg,
}: {
  src: string | undefined
  alt: string
  className?: string
  classNameImg?: string
}) {
  return (
    <Avatar className={className}>
      <AvatarImage
        src={src}
        alt={alt ?? "User's Image"}
        className={cn(`object-cover object-center`, classNameImg)}
        loading="lazy"
      />
      <AvatarFallback className="bg-gradient-accent text-foreground font-bold">
        {(alt as string)
          ? (alt as string)
              .split(' ')
              .map((n) => n[0])
              .join('')
          : ''}
      </AvatarFallback>
    </Avatar>
  )
}
