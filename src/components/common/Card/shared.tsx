import type { ReactNode } from 'react'

export type CompactBandCardBaseProps = {
  imageSrc: string
  imageAlt?: string
  title?: ReactNode
  subtitle?: ReactNode
  description?: ReactNode
}

type CompactBandCardContentProps = CompactBandCardBaseProps & {
  contentClassName?: string
  descriptionClassName?: string
  descriptionMultiline?: boolean
}

export const compactBandCardClassName =
  'box-border flex h-[86px] w-[348px] max-w-full items-center gap-[10px] rounded-[16px] bg-neutral-0 px-[16px] py-[12px] text-left shadow-[0_4px_8px_rgb(20_20_20_/10%)]'

export const listCardClassName =
  'box-border flex h-[86px] w-[348px] max-w-full items-center rounded-[16px] bg-neutral-0 px-[16px] py-[12px] text-left shadow-[0_4px_8px_rgb(20_20_20_/10%)]'

export const CompactBandCardContent = ({
  imageSrc,
  imageAlt = '',
  title,
  subtitle,
  description,
  contentClassName = '',
  descriptionClassName = 'text-primary-400',
  descriptionMultiline = false,
}: CompactBandCardContentProps) => {
  return (
    <>
      <img
        alt={imageAlt}
        className="h-[62px] w-[62px] shrink-0 rounded-full object-cover"
        src={imageSrc}
      />

      <div className={`h-[62px] w-[165px] min-w-0 shrink-0 ${contentClassName}`}>
        <h3 className="font-body text-body1 m-0 truncate text-neutral-900">
          {title}
        </h3>
        <p className="font-body text-body5 m-0 mt-[3px] truncate text-neutral700">
          {subtitle}
        </p>
        <p
          className={`font-body text-body5 m-0 mt-[3px]${
            descriptionMultiline ? '' : 'truncate'
          } ${descriptionClassName}`}
        >
          {description}
        </p>
      </div>
    </>
  )
}
