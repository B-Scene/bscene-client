import { useLayoutEffect, useRef, useState } from 'react'
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

const tagChipClassName =
  'flex w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary-50 px-[5px] py-[2px] font-body text-body5 text-primary-400'

const getTagChipClassName = (tag: ReactNode) => {
  const tagText = typeof tag === 'string' ? tag.trim() : ''
  const isTwoLetterTag = tagText.length === 2

  return isTwoLetterTag ? `${tagChipClassName} min-w-[32px]` : tagChipClassName
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
  showTags = true,
  onClick,
  ariaLabel,
}: NewsCardProps) => {
  const hasContentImage = Boolean(contentImageSrc)
  const isInteractive = Boolean(onClick)
  const tagContainerRef = useRef<HTMLDivElement>(null)
  const tagMeasureRefs = useRef<Array<HTMLSpanElement | null>>([])
  const [visibleTagCount, setVisibleTagCount] = useState(tags.length)

  useLayoutEffect(() => {
    if (!showTags || tags.length === 0) return

    let animationFrameId: number | null = null

    const calculateVisibleTags = () => {
      const container = tagContainerRef.current
      if (!container) {
        setVisibleTagCount(tags.length)
        return
      }

      const availableWidth = container.clientWidth
      let usedWidth = 0
      let nextVisibleCount = 0

      for (const tagElement of tagMeasureRefs.current) {
        if (!tagElement) continue

        const nextWidth =
          usedWidth + (nextVisibleCount > 0 ? 4 : 0) + tagElement.offsetWidth

        if (nextWidth > availableWidth) break

        usedWidth = nextWidth
        nextVisibleCount += 1
      }

      setVisibleTagCount(nextVisibleCount)
    }

    const scheduleCalculation = () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }

      animationFrameId = window.requestAnimationFrame(calculateVisibleTags)
    }

    scheduleCalculation()

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        if (animationFrameId !== null) {
          window.cancelAnimationFrame(animationFrameId)
        }
      }
    }

    const resizeObserver = new ResizeObserver(scheduleCalculation)
    const container = tagContainerRef.current
    if (container) resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [showTags, tags])

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
      className={`box-border flex h-[238px] w-[200px] shrink-0 flex-col items-start gap-3 rounded-[12px] bg-neutral-0 p-3 text-left shadow-[0_0_10px_1px_rgba(20,20,20,0.12)] ${
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

      <p className="m-0 line-clamp-2 overflow-hidden font-body text-caption2 text-neutral-900">
        {title}
      </p>

      {showTags && tags.length > 0 ? (
        <div
          ref={tagContainerRef}
          className="relative mt-auto flex h-[20px] max-w-full flex-nowrap gap-[4px] overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none invisible absolute left-0 top-0 flex flex-nowrap gap-[4px]"
          >
            {tags.map((tag, index) => (
              <span
                ref={(element) => {
                  tagMeasureRefs.current[index] = element
                }}
                className={getTagChipClassName(tag)}
                key={index}
              >
                {tag}
              </span>
            ))}
          </div>

          {tags.slice(0, visibleTagCount).map((tag, index) => (
            <span className={getTagChipClassName(tag)} key={index}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}

export default NewsCard
