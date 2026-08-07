import type { ReactNode } from "react";
import BSceneLogo from "@/assets/bscene-logo.svg";

type HomeHeaderProps = {
  rightAction: ReactNode;
  leftAction?: ReactNode;
};

export const HomeHeader = ({ rightAction, leftAction }: HomeHeaderProps) => {
  return (
    <header className="-mx-5 box-border grid h-12 w-[393px] max-w-[calc(100%+40px)] grid-cols-[1fr_auto_1fr] items-center bg-neutral-0 px-6">
      <div className="flex items-center gap-4 justify-self-start [&>button]:flex [&>button]:size-6 [&>button]:items-center [&>button]:justify-center [&_svg]:size-6">
        {leftAction}
      </div>

      <img
        src={BSceneLogo}
        alt="B:Scene"
        className="h-[30px] w-[105px] justify-self-center"
      />

      <div className="flex items-center justify-end gap-4 [&>button]:flex [&>button]:size-6 [&>button]:items-center [&>button]:justify-center [&_svg]:size-6">
        {rightAction}
      </div>
    </header>
  );
};
