import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BSceneLogo from "@/assets/bscene-logo.svg";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CheckCircleIcon from "@/assets/icons/check-circle.svg";
import CheckCircleActiveIcon from "@/assets/icons/check-circle-active.svg";
import CheckIcon from "@/assets/icons/check.svg";
import CheckActiveIcon from "@/assets/icons/check-active.svg";
import Button from "@/components/common/Button/Button";
import {
  AGREEMENTS,
  AGREEMENT_DETAILS,
  type AgreementKey,
} from "@/features/onboarding/agreementData";

const AgreementPage = () => {
  const navigate = useNavigate();

  const [checked, setChecked] = useState<Record<AgreementKey, boolean>>({
    age: false,
    service: false,
    privacy: false,
    marketing: false,
  });

  const [selectedAgreement, setSelectedAgreement] =
    useState<AgreementKey | null>(null);

  const isAllChecked = useMemo(
    () => Object.values(checked).every(Boolean),
    [checked],
  );

  const isRequiredChecked = useMemo(
    () =>
      AGREEMENTS.filter((item) => item.required).every(
        (item) => checked[item.key],
      ),
    [checked],
  );

  const handleToggleAll = () => {
    const nextChecked = !isAllChecked;

    setChecked({
      age: nextChecked,
      service: nextChecked,
      privacy: nextChecked,
      marketing: nextChecked,
    });
  };

  const handleToggleItem = (key: AgreementKey) => {
    setChecked((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNext = () => {
    if (!isRequiredChecked) return;
    navigate("/onboarding/mode");
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 px-5 pb-[96px]">
      <header className="flex h-12 items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
          aria-label="뒤로가기"
        >
          <img src={ArrowLeftIcon} alt="" className="size-5" />
        </button>

        <h1 className="text-label2 text-neutral-900">약관 동의</h1>

        <div className="size-6" />
      </header>

      <section className="pt-10">
        <div className="flex flex-col items-start gap-1">
          <img src={BSceneLogo} alt="B : Scene" className="h-5 w-auto" />
          <h2 className="text-h3 text-neutral-900">서비스 이용약관</h2>
        </div>

        <button
          type="button"
          onClick={handleToggleAll}
          className="mt-7 flex w-full items-center gap-2 border-b border-neutral-200 pb-4"
        >
          <AgreementCheckIcon checked={isAllChecked} type="circle" />

          <span className="text-body1 text-neutral-900">
            모두 동의 (선택 정보 포함)
          </span>
        </button>

        <ul className="mt-4 flex flex-col gap-3">
          {AGREEMENTS.map((item) => (
            <li key={item.key} className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggleItem(item.key)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                <AgreementCheckIcon checked={checked[item.key]} />

                <span className="text-caption1 text-neutral-900">
                  [{item.required ? "필수" : "선택"}] {item.label}
                </span>
              </button>

              <button
                type="button"
                className="text-caption2 text-neutral-500"
                onClick={() => setSelectedAgreement(item.key)}
              >
                보기
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="fixed inset-x-0 bottom-7 px-5">
        <Button
          type="button"
          size="large"
          tone={isRequiredChecked ? "pink" : "gray"}
          disabled={!isRequiredChecked}
          onClick={handleNext}
          className="w-full"
        >
          다음
        </Button>
      </div>

      {selectedAgreement && (
        <TermModal
          title={AGREEMENT_DETAILS[selectedAgreement].title}
          content={AGREEMENT_DETAILS[selectedAgreement].content}
          onClose={() => setSelectedAgreement(null)}
        />
      )}
    </main>
  );
};

export default AgreementPage;

type AgreementCheckIconProps = {
  checked: boolean;
  type?: "circle" | "check";
};

const AgreementCheckIcon = ({
  checked,
  type = "check",
}: AgreementCheckIconProps) => {
  const icon =
    type === "circle"
      ? checked
        ? CheckCircleActiveIcon
        : CheckCircleIcon
      : checked
        ? CheckActiveIcon
        : CheckIcon;

  return (
    <img
      src={icon}
      alt=""
      className={`${type === "circle" ? "size-6" : "size-5"} shrink-0`}
    />
  );
};

const TermModal = ({
  title,
  content,
  onClose,
}: {
  title: string;
  content: string;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40"
    onClick={onClose}>
      <div className="w-full rounded-t-2xl bg-neutral-0 px-5 pb-7 pt-5"
      onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-label1 text-neutral-900">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="text-caption1 text-neutral-500"
          >
            닫기
          </button>
        </div>

        <div className="max-h-[60dvh] overflow-y-auto whitespace-pre-line text-body5 leading-[1.6] text-neutral-700">
          {content}
        </div>
      </div>
    </div>
  );
};