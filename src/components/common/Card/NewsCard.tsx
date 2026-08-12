import type { KeyboardEvent, ReactNode } from 'react'

type NewsCardProps = {
  profileImageSrc: string
  profileImageAlt?: string
  contentImageSrc?: string
  contentImageAlt?: string
  bandName?: ReactNode
  meta?: ReactNode
  title?: ReactNode
  tags?: ReactNode[]
  showTags?: boolean
  onClick?: () => void
  ariaLabel?: string
}

const NewsCard = ({
  profileImageSrc,
  profileImageAlt = '',
  contentImageSrc,
  contentImageAlt = '',
  bandName = 'WAVY',
  meta = '장르 · 지역 · 2시간 전',
  title = (
    <>
      다음주 홍대 롤링홀에서
      <br />
      라이브 공연이 예정되어있어요!
    </>
  ),
  tags = ['홍대', '정기공연', '인디팝'],
  showTags = false,
  onClick,
  ariaLabel,
}: NewsCardProps) => {
  const hasContentImage = Boolean(contentImageSrc)
  const isInteractive = Boolean(onClick)

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    onClick()
  }

  return (
    <article
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      className={`box-border flex h-[196px] w-[200px] shrink-0 flex-col items-start gap-3 rounded-[12px] bg-neutral-0 p-3 text-left shadow-[0_0_10px_1px_rgba(20,20,20,0.12)] ${
        isInteractive
          ? 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400'
          : ''
      }`}
    >
      <header className="flex items-center gap-[8px]">
        <img
          alt={profileImageAlt}
          className="h-[36px] w-[36px] shrink-0 rounded-full object-cover"
          src={profileImageSrc}
        />
        <div className="min-w-0">
          <h3 className="m-0 truncate font-body text-caption3 text-neutral-900">
            {bandName}
          </h3>
          <p className="m-0 truncate font-body text-body5 text-neutral-600">
            {meta}
          </p>
        </div>
      </header>

      {hasContentImage ? (
        <img
          alt={contentImageAlt}
          className="h-[82px] w-full shrink-0 rounded-[8px] object-cover"
          src={contentImageSrc}
        />
      ) : null}

      <p className="m-0 line-clamp-2 overflow-hidden font-body text-body5 text-neutral-900">
        {title}
      </p>

      {showTags && tags.length > 0 ? (
        <div className="mt-auto mb-[2px] flex max-h-[30px] max-w-full flex-wrap gap-[4px] overflow-hidden">
          {tags.map((tag, index) => (
            <span
              className="inline-flex h-[12px] min-w-[30px] max-w-full items-center justify-center truncate whitespace-nowrap rounded-full bg-primary-50 px-[5px] font-body text-caption5 text-primary-400"
              key={index}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}

export default NewsCard
