import type { ButtonHTMLAttributes } from 'react'
import type { CompactBandCardBaseProps } from './shared'
import { CompactBandCardContent, compactBandCardClassName } from './shared'
import notificationIcon from '../../../assets/Notification.svg'

type CardTone = 'pink' | 'orange'

type BandLiveCardProps = CompactBandCardBaseProps & {
  bandName?: CompactBandCardBaseProps['subtitle']
  schedule?: CompactBandCardBaseProps['description']
  showNotificationButton?: boolean
  notificationIconSrc?: string
  notificationIconAlt?: string
  notificationLabel?: CompactBandCardBaseProps['description']
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
  tone = 'pink',
  onNotificationClick,
}: BandLiveCardProps) => {
  const toneClasses = toneClassNames[tone]

  return (
    <article className={compactBandCardClassName}>
      <CompactBandCardContent
        description={description}
        descriptionClassName={toneClasses.description}
        imageAlt={imageAlt}
        imageSrc={imageSrc}
        subtitle={subtitle}
        title={title}
      />

      {showNotificationButton ? (
        <button
          className={`font-body text-caption3 inline-flex h-[32px] w-[81px] shrink-0 cursor-pointer items-center justify-center gap-[4px] rounded-[100px] border-0 px-[8px] transition duration-150 ease-out active:translate-y-px focus-visible:outline-0 focus-visible:ring-4 ${toneClasses.button}`}
          onClick={onNotificationClick}
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