import type { ReactNode } from 'react'
import { listCardClassName } from './shared'

type VideoCardProps = {
  imageSrc: string
  imageAlt?: string
  title?: ReactNode
  bandName?: ReactNode
  timeAgo?: ReactNode
}

const VideoCard = ({
  imageSrc,
  imageAlt = '',
  title = '"봄날" 커버 영상',
  bandName = 'WAVY',
  timeAgo = '5시간 전',
}: VideoCardProps) => {
  return (
    <article className={listCardClassName}>
      <img
        alt={imageAlt}
        className="h-[62px] w-[88px] shrink-0 rounded-[8px] object-cover"
        src={imageSrc}
      />

      <div className="ml-[10px] min-w-0">
        <h3 className="font-body text-body1 m-0 truncate text-neutral-900">
          {title}
        </h3>
        <p className="font-body text-caption2 m-0 mt-[2px] truncate text-neutral-700">
          {bandName}
        </p>
        <p className="font-body text-body5 m-0 mt-[4px] truncate text-neutral-500">
          {timeAgo}
        </p>
      </div>
    </article>
  )
}

export default VideoCard
