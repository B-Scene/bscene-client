import type { ButtonHTMLAttributes, KeyboardEvent, MouseEventHandler } from 'react'
import type { CompactBandCardBaseProps } from './shared'
import { CompactBandCardContent, compactBandCardClassName } from './shared'

type BandCardProps = CompactBandCardBaseProps & {
  ariaLabel?: string
  className?: string
  contentClassName?: string
  descriptionClassName?: string
  descriptionMultiline?: boolean
  following?: boolean
  onClick?: MouseEventHandler<HTMLElement>
  onToggleFollow?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
}

const BandCard = ({
  imageSrc,
  imageAlt = '',
  ariaLabel,
  className = '',
  contentClassName,
  descriptionClassName,
  descriptionMultiline,
  title = '밴드명',
  subtitle = '장르 · 지역',
  description = '',
  following = false,
  onClick,
  onToggleFollow,
}: BandCardProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (
      !onClick ||
      event.repeat ||
      (event.key !== 'Enter' && event.key !== ' ')
    ) {
      return
    }

    event.preventDefault()
    event.currentTarget.click()
  }

  return (
    <article
      aria-label={ariaLabel}
      className={`${compactBandCardClassName}${onClick ? ' cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CompactBandCardContent
        contentClassName={contentClassName}
        description={description}
        descriptionClassName={descriptionClassName}
        descriptionMultiline={descriptionMultiline}
        imageAlt={imageAlt}
        imageSrc={imageSrc}
        subtitle={subtitle}
        title={title}
      />

      <button
        className={[
          'font-body text-caption3 inline-flex h-[32px] w-[69px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] border-[1px] transition duration-150 ease-out active:translate-y-px focus-visible:outline-0 focus-visible:ring-4 focus-visible:ring-primary-400',
          following
            ? 'border-primary-50 bg-primary-50 text-primary-400'
            : 'border-primary-400 bg-neutral-0 text-primary-400',
        ].join(' ')}
        onClick={(event) => {
          event.stopPropagation()
          onToggleFollow?.(event)
        }}
        type="button"
      >
        {following ? '팔로잉' : '팔로우'}
      </button>
    </article>
  )
}

export default BandCard
