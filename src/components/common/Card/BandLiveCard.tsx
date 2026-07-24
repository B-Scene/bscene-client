import type { ButtonHTMLAttributes } from 'react'
import type { CompactBandCardBaseProps } from './shared'
import { CompactBandCardContent, compactBandCardClassName } from './shared'
import notificationIcon from '../../../assets/Notification.svg'

type CardTone = 'pink' | 'orange'
type NotificationVariant = 'soft' | 'outline'
type NotificationContentSize = 'default' | 'compact'

type BandLiveCardProps = CompactBandCardBaseProps & {
  bandName?: CompactBandCardBaseProps['subtitle']
  schedule?: CompactBandCardBaseProps['description']
  showNotificationButton?: boolean
  notificationIconSrc?: string
  notificationIconAlt?: string
  notificationLabel?: CompactBandCardBaseProps['description']
  notificationVariant?: NotificationVariant
  notificationContentSize?: NotificationContentSize
  tone?: CardTone
  onNotificationClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
}

const toneClassNames: Record<CardTone, {
  description: string
  button: string
}> = {
  pink: {
    description: 'text-primary-300',
    button: 'bg-primary-50 text-primary-400 focus-visible:ring-primary-400',
  },
  orange: {
    description: 'text-secondary-500',
    button: 'bg-secondary-100 text-secondary-500 focus-visible:ring-secondary-500',
  },
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
  notificationVariant = 'soft',
  notificationContentSize = 'default',
  tone = 'pink',
  onNotificationClick,
}: BandLiveCardProps) => {
  const toneClasses = toneClassNames[tone]
  const notificationClassName =
    notificationVariant === 'outline'
      ? tone === 'pink'
        ? 'border-primary-400 bg-neutral-0 text-primary-400 focus-visible:ring-primary-400'
        : 'border-secondary-500 bg-neutral-0 text-secondary-500 focus-visible:ring-secondary-500'
      : `${toneClasses.button} border-transparent`
  const notificationPaddingClassName =
    notificationContentSize === 'compact'
      ? 'px-[2px]'
      : notificationVariant === 'outline'
        ? 'px-[4px]'
        : 'px-[8px]'
  const notificationTextClassName =
    notificationContentSize === 'compact' ? 'text-body5' : 'text-caption3'
  const notificationIconClassName =
    notificationContentSize === 'compact'
      ? 'h-[14px] w-[14px]'
      : 'h-[18px] w-[18px]'

  return (
    <article className={compactBandCardClassName}>
      <CompactBandCardContent
        contentClassName="h-[62px] min-w-0 flex-1"
        description={description}
        descriptionClassName={toneClasses.description}
        imageAlt={imageAlt}
        imageSrc={imageSrc}
        subtitle={subtitle}
        title={title}
      />

      {showNotificationButton ? (
        <button
          className={`font-body inline-flex h-[32px] w-[81px] shrink-0 cursor-pointer items-center justify-center gap-[4px] whitespace-nowrap rounded-[100px] border transition duration-150 ease-out active:translate-y-px focus-visible:outline-0 focus-visible:ring-4 ${notificationTextClassName} ${notificationPaddingClassName} ${notificationClassName}`}
          onClick={onNotificationClick}
          type="button"
        >
          {notificationIconSrc ? (
            <img
              alt={notificationIconAlt}
              className={`${notificationIconClassName} shrink-0 object-contain`}
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
