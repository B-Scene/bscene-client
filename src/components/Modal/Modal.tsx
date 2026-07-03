import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ModalTone = 'pink' | 'orange'

type ModalProps = {
  tone?: ModalTone
  title?: ReactNode
  description?: ReactNode
  cancelLabel?: ReactNode
  confirmLabel?: ReactNode
  showCancel?: boolean
  onCancel?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  onConfirm?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
}

type ModalActionVariant = 'outline' | 'solid'

const toneClassNames: Record<ModalTone, Record<ModalActionVariant, string>> = {
  pink: {
    outline:
      'border-primary-400 bg-neutral-0 text-primary-400 focus-visible:ring-primary-400',
    solid:
      'border-primary-400 bg-primary-400 text-neutral-0 focus-visible:ring-primary-400',
  },
  orange: {
    outline:
      'border-secondary-500 bg-neutral-0 text-secondary-500 focus-visible:ring-secondary-500',
    solid:
      'border-secondary-500 bg-secondary-500 text-neutral-0 focus-visible:ring-secondary-500',
  },
}

const actionClassName =
  'font-body text-label2 inline-flex h-[42px] w-[120px] cursor-pointer items-center justify-center rounded-[12px] border-[1.5px] transition duration-150 ease-out active:enabled:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-0 focus-visible:ring-4'

const Modal = ({
  tone = 'pink',
  title = '라이브를 나갈까요?',
  description = (
    <>
      진행 중인 라이브에서 나가게 돼요.
      <br />
      언제든 다시 입장할 수 있어요.
    </>
  ),
  cancelLabel = '취소',
  confirmLabel = '나가기',
  showCancel = true,
  onCancel,
  onConfirm,
}: ModalProps) => {
  return (
    <section
      aria-modal="true"
      className="box-border flex h-[184px] w-[313px] max-w-full flex-col items-center bg-neutral-0 px-[32px] py-[24px] text-center"
      role="dialog"
    >
      <div className="flex flex-col items-center gap-[10px]">
        <h3 className="font-body text-label1 m-0 text-neutral-900">
          {title}
        </h3>

        <p className="font-body text-caption1 m-0 text-neutral-600">
          {description}
        </p>
      </div>

      <div className="mt-[20px] flex w-[249px] items-center justify-center gap-[8px]">
        {showCancel ? (
          <button
            className={`${actionClassName} ${toneClassNames[tone].outline}`}
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
        ) : null}
        <button
          className={`${actionClassName} ${toneClassNames[tone].solid}`}
          onClick={onConfirm}
          type="button"
        >
          {confirmLabel}
        </button>
      </div>
    </section>
  )
}

export default Modal
