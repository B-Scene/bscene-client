import type { CompactBandCardBaseProps } from './shared'
import { compactBandCardClassName } from './shared'
import notificationIcon from '../../assets/Notification.svg'

type BandLiveCardProps = CompactBandCardBaseProps & {
  bandName?: CompactBandCardBaseProps['subtitle']
  schedule?: CompactBandCardBaseProps['description']
  showNotificationButton?: boolean
  notificationIconSrc?: string
  notificationIconAlt?: string
  notificationLabel?: CompactBandCardBaseProps['description']
}

const BandLiveCard = ({
  imageSrc,
  imageAlt = '',
  title = '라이브 제목',
  bandName,
  subtitle = bandName ?? '밴드명',
  schedule,
  description = schedule ?? '5.28. (화) 오후 8:00',
  showNotificationButton = false,
  notificationIconSrc = notificationIcon,
  notificationIconAlt = '',
  notificationLabel = '알림 받기',
}: BandLiveCardProps) => {
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
        <p className="font-body text-caption2 m-0 mt-[4px] truncate text-[var(--color-primary-300)]">
          {description}
        </p>
      </div>

      {showNotificationButton ? (
        <button
          className="font-body text-caption3 inline-flex h-[32px] w-[81px] shrink-0 cursor-pointer items-center justify-center gap-[4px] rounded-[100px] border-0 bg-[var(--color-primary-50)] px-[8px] text-[var(--color-primary-400)] transition duration-150 ease-out active:translate-y-px focus-visible:outline-0 focus-visible:ring-4 focus-visible:ring-[var(--color-primary-400)]"
          type="button"
        >
          {notificationIconSrc ? (
            <img
              alt={notificationIconAlt}
              className="h-[13px] w-[13px] shrink-0 object-contain"
              src={notificationIconSrc}
            />
          ) : null}
          <span>{notificationLabel}</span>
        </button>
      ) : null}
    </article>
  )
}

export default BandLiveCard
