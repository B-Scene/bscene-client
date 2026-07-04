import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Button from '../common/Button/Button'

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
      className="box-border flex min-h-[184px] w-[313px] max-w-full flex-col items-center bg-neutral-0 px-[32px] py-[24px] text-center"
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
          <Button
            onClick={onCancel}
            size="modal"
            tone={tone}
            variant="outline"
          >
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          onClick={onConfirm}
          size="modal"
          tone={tone}
          variant="solid"
        >
          {confirmLabel}
        </Button>
      </div>
    </section>
  )
}

export default Modal
