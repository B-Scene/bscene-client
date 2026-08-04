import type { BandGenre, BandRegion } from "@/types/band/band";
import type { BandMemberPart } from "@/types/band/bandMember";
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
  INDIE: "인디",
  POP: "팝",
  POP_ROCK: "팝록",
  JAZZ: "재즈",
  BLUES: "블루스",
  ALTERNATIVE_ROCK: "얼터너티브록",
  PSYCHEDELIC_ROCK: "사이키델릭록",
  ELECTRONIC_ROCK: "일렉트로닉록",
  FOLK_ROCK: "포크록",
  PUNK_ROCK: "펑크록",
  HARD_ROCK: "하드록",
  METAL: "메탈",
  ETC: "etc.",
};

export const PERFORMANCE_GENRE_LABELS: Record<PerformanceGenre, string> =
  BAND_GENRE_LABELS;

export const PERFORMANCE_AGE_RATING_LABELS: Record<
  PerformanceAgeRating,
  string
> = {
  ALL: "전체 관람가",
  AGE_12: "12세 이상",
  AGE_15: "15세 이상",
  AGE_19: "19세 이상",
};

export const getGenreLabel = (genre: string) =>
  BAND_GENRE_LABELS[genre as BandGenre] ??
  PERFORMANCE_GENRE_LABELS[genre as PerformanceGenre] ??
  genre;

export const getRegionLabel = (region: string) =>
  BAND_REGION_LABELS[region as BandRegion] ?? region;

export const BAND_MEMBER_PART_LABELS: Record<BandMemberPart, string> = {
  VOCAL: "보컬",
  GUITAR: "기타",
  BASS: "베이스",
  KEYBOARD: "키보드",
  DRUM: "드럼",
  ETC: "etc",
};

export const getPartLabel = (part: string) =>
  BAND_MEMBER_PART_LABELS[part as BandMemberPart] ?? part;

const toReverseMap = <T extends string>(
  labels: Record<T, string>,
): Partial<Record<string, T>> => {
  const reverse: Partial<Record<string, T>> = {};
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
