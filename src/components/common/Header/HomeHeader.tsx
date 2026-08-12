import type { ReactNode } from "react";
import BSceneLogo from "@/assets/bscene-logo.svg";

type HomeHeaderProps = {
  rightAction: ReactNode;
  leftAction?: ReactNode;
};

export const HomeHeader = ({ rightAction, leftAction }: HomeHeaderProps) => {
  return (
    <header className="relative -mx-5 box-border flex h-12 w-[calc(100%+40px)] items-center justify-between bg-neutral-0 pl-3.75 pr-6">
      <div className="flex items-center gap-4 [&>button]:flex [&>button]:size-6 [&>button]:items-center [&>button]:justify-center [&_svg]:size-6">
        {leftAction}
      </div>

      <img
        src={BSceneLogo}
        alt="B:Scene"
        className="absolute top-1/2 left-1/2 h-7.5 w-26.25 -translate-x-1/2 -translate-y-1/2"
      />

      <div className="flex items-center gap-4 [&>button]:flex [&>button]:size-6 [&>button]:items-center [&>button]:justify-center [&_svg]:size-6">
        {rightAction}
      </div>
    </header>
  );
};
