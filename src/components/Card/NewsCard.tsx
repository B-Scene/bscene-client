import type { ReactNode } from 'react'

type NewsCardProps = {
  profileImageSrc: string
  profileImageAlt?: string
  contentImageSrc: string
  contentImageAlt?: string
  bandName?: ReactNode
  meta?: ReactNode
  title?: ReactNode
  tags?: ReactNode[]
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
}: NewsCardProps) => {
  return (
    <article className="box-border flex h-[194px] w-[171px] max-w-full flex-col gap-[8px] rounded-[12px] bg-[var(--color-neutral-0)] p-[20px] text-left shadow-[0_4px_18px_color-mix(in_srgb,var(--color-neutral-900)_12%,transparent)]">
      <header className="flex items-center gap-[8px]">
        <img
          alt={profileImageAlt}
          className="h-[28px] w-[28px] shrink-0 rounded-full object-cover"
          src={profileImageSrc}
        />
        <div className="min-w-0">
          <h3 className="font-body text-body4 m-0 truncate text-[var(--color-neutral-900)]">
            {bandName}
          </h3>
          <p className="font-body text-caption4 m-0 mt-[1px] truncate text-[var(--color-neutral-600)]">
            {meta}
          </p>
        </div>
      </header>

      <img
        alt={contentImageAlt}
        className="h-[82px] w-[151px] shrink-0 rounded-[8px] object-cover"
        src={contentImageSrc}
      />

      <p className="font-body text-body5 m-0 text-[var(--color-neutral-900)]">
        {title}
      </p>

      <div className="flex gap-[6px]">
        {tags.map((tag, index) => (
          <span
            className="font-body text-caption5 inline-flex h-[12px] w-[30px] items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-400)]"
            key={index}
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}

export default NewsCard
