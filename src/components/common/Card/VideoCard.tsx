import type { MouseEventHandler, ReactNode } from 'react'
import { listCardClassName } from './shared'

type VideoCardProps = {
  imageSrc?: string
  imageAlt?: string
  title?: ReactNode
  bandName?: ReactNode
  timeAgo?: ReactNode
  duration?: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  ariaLabel?: string
}

const VideoCard = ({
  imageSrc,
  imageAlt = '',
  title = '"봄날" 커버 영상',
  bandName = 'WAVY',
  timeAgo = '5시간 전',
  duration,
  onClick,
  ariaLabel,
}: VideoCardProps) => {
  const content = (
    <>
      <div className="relative h-[62px] w-[88px] shrink-0 overflow-hidden rounded-[8px] bg-neutral-200">
        {imageSrc ? (
          <img
            alt={imageAlt}
            className="h-full w-full object-cover"
            src={imageSrc}
          />
        ) : null}
        {duration ? (
          <span className="absolute right-1 bottom-1 rounded-[3px] bg-neutral-900 px-1 font-body text-caption6 text-neutral-0">
            {duration}
          </span>
        ) : null}
      </div>

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
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        className={listCardClassName}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    )
  }

  return <article className={listCardClassName}>{content}</article>
}

export default VideoCard
