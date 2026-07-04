import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonSize =
  | 'large'
  | 'small'
  | 'modal'
  | 'chipLarge'
  | 'chipSmall'
  | 'chipRectangle'
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
    'text-label1 h-[52px] w-[353px] rounded-[12px] py-[14px] not-italic',
  small:
    'text-label2 h-[48px] w-[87px] rounded-[10px] px-[12px] py-[8px] not-italic',
  modal:
    'text-label2 h-[42px] w-[120px] rounded-[12px] px-[12px] not-italic',
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
      'border-primary-400 bg-primary-400 text-neutral-0 focus-visible:ring-primary-400',
    outline:
      'border-primary-400 bg-neutral-0 text-primary-400 focus-visible:ring-primary-400',
    soft:
      'border-primary-100 bg-primary-100 text-primary-400 focus-visible:ring-primary-400',
  },
  orange: {
    solid:
      'border-secondary-500 bg-secondary-500 text-neutral-0 focus-visible:ring-secondary-500',
    outline:
      'border-secondary-500 bg-neutral-0 text-secondary-500 focus-visible:ring-secondary-500',
    soft:
      'border-secondary-100 bg-secondary-100 text-secondary-500 focus-visible:ring-secondary-500',
  },
  gray: {
    solid:
      'border-neutral-300 bg-neutral-300 text-neutral-600 focus-visible:ring-neutral-600',
    outline:
      'border-neutral-300 bg-neutral-0 text-neutral-600 focus-visible:ring-neutral-600',
    soft:
      'border-neutral-300 bg-neutral-300 text-neutral-600 focus-visible:ring-neutral-600',
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
