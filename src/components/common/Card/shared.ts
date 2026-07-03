import type { ReactNode } from 'react'

export type CompactBandCardBaseProps = {
  imageSrc: string
  imageAlt?: string
  title?: ReactNode
  subtitle?: ReactNode
  description?: ReactNode
}

export const compactBandCardClassName =
  'box-border flex h-[86px] w-[348px] max-w-full items-center gap-[10px] rounded-[16px] bg-[var(--color-neutral-0)] px-[16px] py-[12px] text-left shadow-[0_4px_8px_color-mix(in_srgb,var(--color-neutral-900)_10%,transparent)]'
