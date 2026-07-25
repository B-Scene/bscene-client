import type { BandGenre, BandRegion } from "@/types/band/band";
import type {
  PerformanceAgeRating,
  PerformanceGenre,
} from "@/types/band/performance";

export const BAND_REGION_LABELS: Record<BandRegion, string> = {
  SEOUL: "서울",
  GYEONGGI: "경기",
  INCHEON: "인천",
  BUSAN: "부산",
  DAEGU: "대구",
  GWANGJU: "광주",
  DAEJEON: "대전",
  ULSAN: "울산",
  SEJONG: "세종",
  CHUNGBUK: "충북",
  CHUNGNAM: "충남",
  JEONBUK: "전북",
  JEONNAM: "전남",
  GYEONGBUK: "경북",
  GYEONGNAM: "경남",
  GANGWON: "강원",
  JEJU: "제주",
};

export const BAND_GENRE_LABELS: Record<BandGenre, string> = {
  METAL: "메탈",
  BLUES: "블루스",
  PSYCHEDELIC_ROCK: "사이키델릭 록",
  ALTERNATIVE_ROCK: "얼터너티브 록",
  INDIE: "인디",
  ELECTRONIC_ROCK: "일렉트로닉 록",
  JAZZ: "재즈",
  POP: "팝",
  POP_ROCK: "팝 록",
  PUNK_ROCK: "펑크 록",
  FOLK_ROCK: "포크 록",
  HARD_ROCK: "하드 록",
  ETC: "기타",
};

export const PERFORMANCE_GENRE_LABELS: Record<PerformanceGenre, string> = {
  ROCK: "록",
  INDIE_POP: "인디팝",
  JAZZ: "재즈",
  METAL: "메탈",
  FOLK: "포크",
  RNB: "R&B",
  BLUES: "블루스",
  PUNK: "펑크",
  ACOUSTIC: "어쿠스틱",
};

export const PERFORMANCE_AGE_RATING_LABELS: Record<
  PerformanceAgeRating,
  string
> = {
  ALL: "전체 관람가",
  AGE_12: "12세 이상",
  AGE_15: "15세 이상",
  AGE_19: "19세 이상",
};

const toReverseMap = <T extends string>(labels: Record<T, string>) => {
  const reverse = {} as Record<string, T>;
  (Object.keys(labels) as T[]).forEach((key) => {
    reverse[labels[key]] = key;
  });
  return reverse;
};

export const BAND_REGION_BY_LABEL = toReverseMap(BAND_REGION_LABELS);
export const BAND_GENRE_BY_LABEL = toReverseMap(BAND_GENRE_LABELS);
export const PERFORMANCE_GENRE_BY_LABEL = toReverseMap(
  PERFORMANCE_GENRE_LABELS,
);
export const PERFORMANCE_AGE_RATING_BY_LABEL = toReverseMap(
  PERFORMANCE_AGE_RATING_LABELS,
);

export const BAND_REGION_LABEL_OPTIONS = Object.values(BAND_REGION_LABELS);
export const BAND_GENRE_LABEL_OPTIONS = Object.values(BAND_GENRE_LABELS);
export const PERFORMANCE_GENRE_LABEL_OPTIONS = Object.values(
  PERFORMANCE_GENRE_LABELS,
);
export const PERFORMANCE_AGE_RATING_LABEL_OPTIONS = Object.values(
  PERFORMANCE_AGE_RATING_LABELS,
);
