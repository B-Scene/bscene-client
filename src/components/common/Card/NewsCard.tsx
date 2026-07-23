import type { ReactNode } from 'react'

type NewsCardProps = {
  profileImageSrc: string
  profileImageAlt?: string
  contentImageSrc?: string
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
  const hasContentImage = Boolean(contentImageSrc)

  return (
    <article className="box-border flex h-[187px] w-[146px] shrink-0 flex-col items-start gap-[8px] rounded-[12px] bg-neutral-0 px-[10px] py-[12px] text-left shadow-[0_0_4px_0_rgba(0,0,0,0.10)]">
      <header className="flex items-center gap-[8px]">
        <img
          alt={profileImageAlt}
          className="h-[20px] w-[20px] shrink-0 rounded-full object-cover"
          src={profileImageSrc}
        />
        <div className="min-w-0">
          <h3 className="m-0 truncate font-body text-[7px] font-bold leading-[10px] text-neutral-900">
            {bandName}
          </h3>
          <p className="m-0 mt-[1px] truncate font-body text-[5px] font-medium leading-[6px] tracking-[0.25px] text-neutral-600">
            {meta}
          </p>
        </div>
      </header>

      {hasContentImage ? (
        <img
          alt={contentImageAlt}
          className="h-[82px] w-full shrink-0 rounded-[8px] object-cover"
          src={contentImageSrc}
        />
      ) : null}

      <p className={`font-body text-body5 m-0 text-neutral-900${hasContentImage ? '' : ' mt-[8px]'}`}>
        {title}
      </p>

      <div className={`flex gap-[4px]${hasContentImage ? '' : ' mt-auto'}`}>
        {tags.map((tag, index) => (
          <span
            className="font-body text-caption5 inline-flex h-[12px] w-[30px] items-center justify-center rounded-full bg-primary-50 text-primary-400"
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
