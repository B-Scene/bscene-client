// 임시 헤더
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="relative flex h-12 items-center justify-center bg-neutral-0 px-3.75">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute left-3.75 flex size-6 items-center justify-center"
        aria-label="뒤로가기"
      >
        <img src={ArrowLeftIcon} alt="" className="size-6" />
      </button>

      <h1 className="text-label2 text-neutral-900">{title}</h1>
    </header>
  );
};
