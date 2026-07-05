import type { ButtonHTMLAttributes } from 'react'
import type { CompactBandCardBaseProps } from './shared'
import { CompactBandCardContent, compactBandCardClassName } from './shared'

type BandCardProps = CompactBandCardBaseProps & {
  following?: boolean
  onToggleFollow?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
}

const BandCard = ({
  imageSrc,
  imageAlt = '',
  title = '밴드명',
  subtitle = '장르 · 지역',
  description = '',
  following = false,
  onToggleFollow,
}: BandCardProps) => {
  return (
    <article className={compactBandCardClassName}>
      <CompactBandCardContent
        description={description}
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
        onClick={onToggleFollow}
        type="button"
      >
        {following ? '팔로잉' : '팔로우'}
      </button>
    </article>
  )
}

export default BandCard
