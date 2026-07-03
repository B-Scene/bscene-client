import type { ReactNode } from 'react'

type VideoCardProps = {
  imageSrc: string
  imageAlt?: string
  title?: ReactNode
  bandName?: ReactNode
  timeAgo?: ReactNode
}

const cardClassName =
  'box-border flex h-[86px] w-[348px] max-w-full items-center rounded-[16px] bg-neutral-0 px-[16px] py-[12px] text-left shadow-[0_4px_8px_rgb(20_20_20_/10%)]'

const VideoCard = ({
  imageSrc,
  imageAlt = '',
  title = '"봄날" 커버 영상',
  bandName = 'WAVY',
  timeAgo = '5시간 전',
}: VideoCardProps) => {
  return (
    <article className={cardClassName}>
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
