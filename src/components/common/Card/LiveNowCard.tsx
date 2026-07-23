import type { ButtonHTMLAttributes, ReactNode } from 'react'
import headsetIcon from '../../../assets/Headset.svg'
import { listCardClassName } from './shared'

type CardTone = 'pink' | 'orange'

type LiveNowCardProps = {
  imageSrc: string
  imageAlt?: string
  title?: ReactNode
  bandName?: ReactNode
  listenerCount?: ReactNode
  listenerIconSrc?: string
  listenerIconAlt?: string
  liveBadgeSrc?: string
  liveBadgeAlt?: string
  tone?: CardTone
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
}

const toneClassNames: Record<CardTone, {
  profileShadow: string
  badge: string
  listener: string
  button: string
}> = {
  pink: {
    profileShadow: 'shadow-[0_0_18px_rgb(240_69_121_/80%)]',
    badge: 'bg-primary-400 text-neutral-0',
    listener: 'text-primary-400',
    button: 'border-primary-400 text-primary-400 focus-visible:ring-primary-400',
  },
  orange: {
    profileShadow: 'shadow-[0_0_18px_rgb(251_177_14_/80%)]',
    badge: 'bg-secondary-500 text-neutral-0',
    listener: 'text-secondary-500',
    button: 'border-secondary-500 text-secondary-500 focus-visible:ring-secondary-500',
  },
}

const LiveNowCard = ({
  imageSrc,
  imageAlt = '',
  title = '라이브 제목',
  bandName = '밴드명',
  listenerCount = '68명 청취 중',
  listenerIconSrc = headsetIcon,
  listenerIconAlt = '',
  liveBadgeSrc,
  liveBadgeAlt = '',
  tone = 'pink',
  onClick,
}: LiveNowCardProps) => {
  const toneClasses = toneClassNames[tone]

  return (
    <article className={`${listCardClassName} relative`}>
      <div className={`relative h-[62px] w-[62px] shrink-0 rounded-full ${toneClasses.profileShadow}`}>
        <img
          alt={imageAlt}
          className="h-full w-full rounded-full object-cover"
          src={imageSrc}
        />
        <span className={`font-body text-label4 absolute bottom-[-2px] left-1/2 inline-flex h-[12px] w-[27px] -translate-x-1/2 items-center justify-center rounded-full ${toneClasses.badge}`}>
          {liveBadgeSrc ? (
            <img
              alt={liveBadgeAlt}
              className="h-full w-full object-contain"
              src={liveBadgeSrc}
            />
          ) : (
            'LIVE'
          )}
        </span>
      </div>

      <div className="ml-[10px] min-w-0 flex-1 pr-[66px]">
        <h3 className="font-body text-body1 m-0 truncate text-neutral-900">
          {title}
        </h3>
        <p className="font-body text-caption2 m-0 mt-[2px] truncate text-neutral-700">
          {bandName}
        </p>
        <p className={`font-body text-caption2 m-0 mt-[4px] flex items-center gap-[6px] truncate ${toneClasses.listener}`}>
          {listenerIconSrc ? (
            <img
              alt={listenerIconAlt}
              className="h-[13px] w-[12px] shrink-0 object-contain"
              src={listenerIconSrc}
            />
          ) : null}
          {listenerCount}
        </p>
      </div>

      <button
        className={`font-body text-caption3 absolute right-[16px] bottom-[12px] inline-flex h-[22px] w-[51px] shrink-0 cursor-pointer items-center justify-center rounded-full border-[1px] bg-neutral-0 transition duration-150 ease-out active:translate-y-px focus-visible:outline-0 focus-visible:ring-4 ${toneClasses.button}`}
        onClick={onClick}
        type="button"
      >
        입장
      </button>
    </article>
  )
}

export default LiveNowCard