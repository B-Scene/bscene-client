import type { FunctionComponent, SVGProps } from 'react';
import BandIcon from '@/assets/icons/band.svg?react';
import BandActiveIcon from '@/assets/icons/band-active.svg?react';
import ExploreIcon from '@/assets/icons/explore.svg?react';
import ExploreActiveIcon from '@/assets/icons/explore-active.svg?react';
import HomeIcon from '@/assets/icons/home.svg?react';
import HomeActiveIcon from '@/assets/icons/home-active.svg?react';
import LiveIcon from '@/assets/icons/live.svg?react';
import MyIcon from '@/assets/icons/my.svg?react';
import MyActiveIcon from '@/assets/icons/my-active.svg?react';
import SessionIcon from '@/assets/icons/session.svg?react';
import SessionActiveIcon from '@/assets/icons/session-active.svg?react';

type NavIcon = FunctionComponent<SVGProps<SVGSVGElement>>;

export interface BottomNavTab {
  id: string;
  label: string;
  Icon: NavIcon;
  ActiveIcon: NavIcon;
}

export const FAN_NAV_TABS: BottomNavTab[] = [
  { id: 'home', label: '홈', Icon: HomeIcon, ActiveIcon: HomeActiveIcon },
  { id: 'explore', label: '탐색', Icon: ExploreIcon, ActiveIcon: ExploreActiveIcon },
  { id: 'live', label: '라이브', Icon: LiveIcon, ActiveIcon: LiveIcon },
  { id: 'my', label: '마이', Icon: MyIcon, ActiveIcon: MyActiveIcon },
];

export const BAND_NAV_TABS: BottomNavTab[] = [
  { id: 'band', label: '내 밴드', Icon: BandIcon, ActiveIcon: BandActiveIcon },
  { id: 'session', label: '세션', Icon: SessionIcon, ActiveIcon: SessionActiveIcon },
  { id: 'live', label: '라이브', Icon: LiveIcon, ActiveIcon: LiveIcon },
  { id: 'my', label: '마이', Icon: MyIcon, ActiveIcon: MyActiveIcon },
];
