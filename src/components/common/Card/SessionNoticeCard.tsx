import type { ReactNode } from 'react'

type SessionNoticeCardProps = {
  title?: ReactNode
  bandName?: ReactNode
  categories?: ReactNode
  dDay?: ReactNode
}

const cardClassName =
  'box-border flex h-[86px] w-[348px] max-w-full items-center rounded-[16px] bg-[var(--color-neutral-0)] px-[16px] py-[12px] text-left shadow-[0_4px_8px_color-mix(in_srgb,var(--color-neutral-900)_10%,transparent)]'

const SessionNoticeCard = ({
  title = '세션 모집 공고',
  bandName = '밴드명',
  categories = '드럼 · 인디 · 서울',
  dDay = 'D-18',
}: SessionNoticeCardProps) => {
  return (
    <article className={`${cardClassName} relative`}>
      <div className="min-w-0 pr-[66px]">
        <h3 className="font-body text-body1 m-0 truncate text-[var(--color-neutral-900)]">
          {title}
        </h3>
        <p className="font-body text-caption2 m-0 mt-[2px] truncate text-[var(--color-neutral-700)]">
          {bandName}
        </p>
        <p className="font-body text-caption2 m-0 mt-[4px] truncate text-[var(--color-secondary-500)]">
          {categories}
        </p>
      </div>

      <span className="font-body text-caption3 absolute right-[16px] bottom-[12px] inline-flex h-[22px] w-[51px] shrink-0 items-center justify-center rounded-full border-[1px] border-[var(--color-secondary-500)] text-[var(--color-secondary-500)]">
        {dDay}
      </span>
    </article>
  )
}

export default SessionNoticeCard
