import type { CompactBandCardBaseProps } from './shared'
import { compactBandCardClassName } from './shared'

type BandCardProps = CompactBandCardBaseProps & {
  name?: CompactBandCardBaseProps['title']
  location?: CompactBandCardBaseProps['subtitle']
  following?: boolean
}

const BandCard = ({
  imageSrc,
  imageAlt = '',
  name,
  title = name ?? 'WAVY',
  location,
  subtitle = location ?? '인디 · 서울',
  description = '몽환적인 사운드와 감각적인 스타일로 주목받는 3인조 밴드',
  following = false,
}: BandCardProps) => {
  return (
    <article className={compactBandCardClassName}>
      <img
        alt={imageAlt}
        className="h-[62px] w-[62px] shrink-0 rounded-full object-cover"
        src={imageSrc}
      />

      <div className="h-[62px] w-[165px] min-w-0 shrink-0">
        <h3 className="font-body text-body1 m-0 truncate text-[var(--color-neutral-900)]">
          {title}
        </h3>
        <p className="font-body text-caption2 m-0 mt-[2px] truncate text-[var(--color-neutral-700)]">
          {subtitle}
        </p>

        <p className="font-body text-caption2 m-0 mt-[4px] truncate text-[var(--color-primary-400)]">
          {description}
        </p>
      </div>

      <button
        className={[
          'font-body text-caption3 inline-flex h-[32px] w-[69px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] border-[1px] transition duration-150 ease-out active:translate-y-px focus-visible:outline-0 focus-visible:ring-4 focus-visible:ring-[var(--color-primary-400)]',
          following
            ? 'border-[var(--color-primary-50)] bg-[var(--color-primary-50)] text-[var(--color-primary-400)]'
            : 'border-[var(--color-primary-400)] bg-[var(--color-neutral-0)] text-[var(--color-primary-400)]',
        ].join(' ')}
        type="button"
      >
        {following ? '팔로잉' : '팔로우'}
      </button>
    </article>
  )
}

export default BandCard
