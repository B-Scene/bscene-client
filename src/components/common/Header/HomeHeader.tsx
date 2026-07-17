import type { ReactNode } from "react";
import BSceneLogo from "@/assets/bscene-logo.svg";

type HomeHeaderProps = {
  rightAction: ReactNode;
};

export const HomeHeader = ({ rightAction }: HomeHeaderProps) => {
  return (
    <header className="-mx-5 box-border inline-flex h-12 w-[393px] max-w-[calc(100%+40px)] items-center justify-end gap-[96px] bg-neutral-0 py-[9px] pl-[144px] pr-6">
      <img
        src={BSceneLogo}
        alt="B:Scene"
        className="h-[30px] w-[105px]"
      />

      <div className="flex size-6 items-center justify-center [&>button]:flex [&>button]:size-6 [&>button]:items-center [&>button]:justify-center [&_svg]:size-6">
        {rightAction}
      </div>
    </header>
  );
};
