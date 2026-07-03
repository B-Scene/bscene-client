import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonSize = 'large' | 'small' | 'chipLarge' | 'chipSmall' | 'chipRectangle'
type ButtonVariant = 'solid' | 'outline' | 'soft'
type ButtonTone = 'pink' | 'orange' | 'gray'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  size?: ButtonSize
  variant?: ButtonVariant
  tone?: ButtonTone
}

const baseClassName =
  'font-body inline-flex box-border cursor-pointer items-center justify-center gap-[10px] border-[1.5px] whitespace-nowrap transition duration-150 ease-out active:enabled:translate-y-px disabled:cursor-not-allowed disabled:transform-none focus-visible:outline-0 focus-visible:ring-4'

const sizeClassNames: Record<ButtonSize, string> = {
  large:
    'text-label1 h-[52px] w-[353px] rounded-[12px] px-[159px] py-[14px] not-italic',
  small:
    'text-label2 h-[48px] w-[87px] rounded-[10px] px-[12px] py-[8px] not-italic',
  chipLarge:
    'text-body1 h-[30px] w-[62px] rounded-[100px] text-center align-middle not-italic',
  chipSmall:
    'text-caption3 h-[26px] w-[56px] rounded-[100px] px-[15px] py-[7px] text-center align-middle not-italic',
  chipRectangle:
    'text-caption3  h-[26px] w-[56px] rounded-[8px] px-[15px] py-[7px] text-center align-middle not-italic',
}

const variantClassNames: Record<ButtonTone, Record<ButtonVariant, string>> = {
  pink: {
    solid:
      'border-[var(--color-primary-400)] bg-[var(--color-primary-400)] text-[var(--color-neutral-0)] focus-visible:ring-[var(--color-primary-400)]',
    outline:
      'border-[var(--color-primary-400)] bg-[var(--color-neutral-0)] text-[var(--color-primary-400)] focus-visible:ring-[var(--color-primary-400)]',
    soft:
      'border-[var(--color-primary-100)] bg-[var(--color-primary-100)] text-[var(--color-primary-400)] focus-visible:ring-[var(--color-primary-400)]',
  },
  orange: {
    solid:
      'border-[var(--color-secondary-500)] bg-[var(--color-secondary-500)] text-[var(--color-neutral-0)] focus-visible:ring-[var(--color-secondary-500)]',
    outline:
      'border-[var(--color-secondary-500)] bg-[var(--color-neutral-0)] text-[var(--color-secondary-500)] focus-visible:ring-[var(--color-secondary-500)]',
    soft:
      'border-[var(--color-secondary-100)] bg-[var(--color-secondary-100)] text-[var(--color-secondary-500)] focus-visible:ring-[var(--color-secondary-500)]',
  },
  gray: {
    solid:
      'border-[var(--color-neutral-300)] bg-[var(--color-neutral-300)] text-[var(--color-neutral-600)] focus-visible:ring-[var(--color-neutral-600)]',
    outline:
      'border-[var(--color-neutral-300)] bg-[var(--color-neutral-0)] text-[var(--color-neutral-600)] focus-visible:ring-[var(--color-neutral-600)]',
    soft:
      'border-[var(--color-neutral-300)] bg-[var(--color-neutral-300)] text-[var(--color-neutral-600)] focus-visible:ring-[var(--color-neutral-600)]',
  },
}

const Button = ({
  children,
  className = '',
  size = 'large',
  variant = 'solid',
  tone = 'pink',
  type = 'button',
  ...props
}: ButtonProps) => {
  const buttonClassName = [
    baseClassName,
    sizeClassNames[size],
    variantClassNames[tone][variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={buttonClassName} type={type} {...props}>
      {children}
    </button>
  )
}

export default Button
