import type { CompactBandCardBaseProps } from './shared'
import { CompactBandCardContent, compactBandCardClassName } from './shared'
import notificationIcon from '../../../assets/Notification.svg'

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
      <CompactBandCardContent
        description={description}
        descriptionClassName="text-primary-300"
        imageAlt={imageAlt}
        imageSrc={imageSrc}
        subtitle={subtitle}
        title={title}
      />

      {showNotificationButton ? (
        <button
          className="font-body text-caption3 inline-flex h-[32px] w-[81px] shrink-0 cursor-pointer items-center justify-center gap-[4px] rounded-[100px] border-0 bg-primary-50 px-[8px] text-primary-400 transition duration-150 ease-out active:translate-y-px focus-visible:outline-0 focus-visible:ring-4 focus-visible:ring-primary-400"
          type="button"
        >
          {notificationIconSrc ? (
            <img
              alt={notificationIconAlt}
              className="h-[18px] w-[18px] shrink-0 object-contain"
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
