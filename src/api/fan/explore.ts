import { AxiosError } from "axios";
import { axiosInstance } from "@/api/axiosInstance";
import type {
  FanExploreApiResponse,
  FanExploreBand,
  FanExploreBandDetail,
  FanExploreContent,
  FanExplorePageResponse,
  FanExplorePerformance,
  FanExplorePostDetail,
  FanExplorePostLikeResponse,
  FanExploreRecentSearch,
  FanExploreRecommendationParams,
  FanExploreSearchParams,
  FanExploreSearchResponse,
  NormalizedFanExploreBandsResponse,
  NormalizedFanExploreContentsResponse,
  NormalizedFanExplorePerformancesResponse,
  NormalizedFanExploreRecentSearch,
  NormalizedFanExploreRecentSearchesResponse,
  NormalizedFanExploreSearchResponse,
} from "@/types/fan/explore";

type FanExplorePageLike<T> = Omit<FanExplorePageResponse<T>, "results"> & {
  sections?: FanExplorePageLike<T>;
  results?: T[] | FanExplorePageResponse<T> | FanExplorePageLike<T>;
  bandSection?: FanExplorePageResponse<T> | T[];
  performanceSection?: FanExplorePageResponse<T> | T[];
  postSection?: FanExplorePageResponse<T> | T[];
  contentResults?: FanExplorePageResponse<T> | T[];
  bandResults?: FanExplorePageResponse<T> | T[];
  performanceResults?: FanExplorePageResponse<T> | T[];
  BAND?: FanExplorePageResponse<T> | T[];
  PERFORMANCE?: FanExplorePageResponse<T> | T[];
  POST?: FanExplorePageResponse<T> | T[];
};
type FanExploreSectionKey<T> = keyof FanExplorePageLike<T>;
const PERFORMANCE_SECTION_KEYS: Array<FanExploreSectionKey<FanExplorePerformance>> = [
  "performances",
  "concerts",
];
const CONTENT_SECTION_KEYS: Array<FanExploreSectionKey<FanExploreContent>> = [
  "contents",
  "posts",
];

type FanExploreContentAlias = FanExploreContent & {
  bandGenre?: string | null;
  bandRegion?: string | null;
  bandImageUrl?: string | null;
  bandProfileUrl?: string | null;
  profileImage?: string | null;
  avatarUrl?: string | null;
  logoUrl?: string | null;
  postTitle?: string | null;
  postContent?: string | null;
  description?: string | null;
  media?: unknown;
  medias?: unknown;
  mediaList?: unknown;
  mediaFiles?: unknown;
  postImages?: unknown;
  postImageUrl?: string | null;
  postImageUrls?: unknown;
  contentImageUrl?: string | null;
  contentImageUrls?: unknown;
  mainImageUrl?: string | null;
  thumbnailImageUrl?: string | null;
  imageUrlList?: unknown;
  mediaUrlList?: unknown;
  createdDate?: string | null;
  createdTime?: string | null;
  postedAt?: string | null;
  uploadedAt?: string | null;
  updatedAt?: string | null;
  registeredAt?: string | null;
};

const assertSuccess = <T>(
  response: Awaited<ReturnType<typeof axiosInstance.get<FanExploreApiResponse<T>>>>,
) => {
  const { data } = response;

  if (!data.isSuccess || data.result == null) {
    throw new AxiosError(
      data.message,
      data.code,
      response.config,
      response.request,
      response,
    );
  }

  return data.result;
};

const assertMutationSuccess = <T>(
  response: Awaited<
    ReturnType<typeof axiosInstance.post<FanExploreApiResponse<T>>>
  >,
): T | null => {
  const { data } = response;

  if (!data.isSuccess) {
    throw new AxiosError(
      data.message,
      data.code,
      response.config,
      response.request,
      response,
    );
  }

  if (data.result == null) {
    return null;
  }

  return data.result;
};

const normalizeCursorPage = <T>(
  result: FanExplorePageResponse<T> | T[],
  fallbackCursor: string | number | undefined,
  expectedSectionKeys?: Array<FanExploreSectionKey<T>>,
) => {
  if (Array.isArray(result)) {
    return {
      items: result,
      hasNext: false,
      nextCursor: null,
      page: 0,
    };
  }

  const items = getSectionItems(result, expectedSectionKeys);

  return {
    ...result,
    items,
    page: result.page ?? 0,
    cursor: result.cursor ?? fallbackCursor,
    hasNext: result.hasNext ?? result.nextCursor != null,
    nextCursor: result.nextCursor ?? null,
  };
};

const normalizeNumberCursorPage = <T>(
  result: FanExplorePageResponse<T> | T[],
  fallbackCursor: number | undefined,
) => {
  const normalized = normalizeCursorPage(result, fallbackCursor);
  const nextCursor =
    typeof normalized.nextCursor === "number"
      ? normalized.nextCursor
      : typeof normalized.nextCursor === "string"
        ? Number(normalized.nextCursor)
        : null;

  return {
    ...normalized,
    nextCursor: Number.isFinite(nextCursor) ? nextCursor : null,
  };
};

const getSectionItems = <T>(
  section?: FanExplorePageResponse<T> | T[],
  sectionKeys?: Array<FanExploreSectionKey<T>>,
) => {
  if (!section) return [];
  if (Array.isArray(section)) return section;

  const page = section as unknown as FanExplorePageLike<T>;
  const getArrayFromKeys = (keys: Array<FanExploreSectionKey<T>>) => {
    for (const key of keys) {
      const value = page[key];

      if (Array.isArray(value)) {
        return value;
      }
    }

    return undefined;
  };
  const getNestedSectionFromKeys = (keys: Array<FanExploreSectionKey<T>>) => {
    for (const key of keys) {
      const value = page[key];

      if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
      }
    }

    return undefined;
  };
  const commonPageKeys: Array<FanExploreSectionKey<T>> = [
    "items",
    "content",
    "data",
    "list",
    "results",
  ];
  const expectedKeys = sectionKeys ?? [];
  const expectedArray = getArrayFromKeys(expectedKeys);

  if (expectedArray) {
    return expectedArray;
  }

  const nestedSection =
    getNestedSectionFromKeys(expectedKeys) ??
    page.sections ??
    page.results ??
    page.bandSection ??
    page.performanceSection ??
    page.postSection ??
    page.contentResults ??
    page.bandResults ??
    page.performanceResults ??
    page.BAND ??
    page.PERFORMANCE ??
    page.POST;

  if (
    nestedSection &&
    typeof nestedSection === "object" &&
    !Array.isArray(nestedSection)
  ) {
    return getSectionItems(
      nestedSection as FanExplorePageResponse<T>,
      sectionKeys,
    );
  }

  const commonPageArray = getArrayFromKeys(commonPageKeys);

  if (commonPageArray) {
    return commonPageArray;
  }

  if (expectedKeys.length > 0) {
    return [];
  }

  return (
    page.bands ??
    page.performances ??
    page.concerts ??
    page.posts ??
    page.contents ??
    page.recommendations ??
    page.recommendedBands ??
    page.recommendBands ??
    page.bandRecommendations ??
    page.keywords ??
    page.recentSearches ??
    page.recentKeywords ??
    page.searchKeywords ??
    page.searchHistories ??
    page.searchHistory ??
    page.histories ??
    page.searches ??
    Object.values(page).find((value): value is T[] => Array.isArray(value)) ??
    []
  );
};

const getSectionCount = <T>(section?: FanExplorePageResponse<T> | T[]) => {
  if (!section) return undefined;
  if (Array.isArray(section)) return section.length;

  const page = section as unknown as FanExplorePageLike<T>;
  const nestedSection =
    page.sections ??
    page.results ??
    page.bandSection ??
    page.performanceSection ??
    page.postSection ??
    page.contentResults ??
    page.bandResults ??
    page.performanceResults ??
    page.BAND ??
    page.PERFORMANCE ??
    page.POST;

  if (
    nestedSection &&
    typeof nestedSection === "object" &&
    !Array.isArray(nestedSection)
  ) {
    return getSectionCount(nestedSection as FanExplorePageResponse<T>);
  }

  return page.totalCount ?? page.totalElements ?? page.total;
};

const normalizeRecentSearches = (
  result:
    | string[]
    | FanExploreRecentSearch[]
    | FanExplorePageResponse<string | FanExploreRecentSearch>,
): NormalizedFanExploreRecentSearchesResponse => {
  const items = Array.isArray(result)
    ? result
    : (result.items ??
      result.content ??
      result.data ??
      result.list ??
      result.results ??
      result.keywords ??
      result.recentSearches ??
      result.recentKeywords ??
      result.searchKeywords ??
      result.searchHistories ??
      result.searchHistory ??
      result.histories ??
      result.searches ??
      Object.values(result).find(
        (value): value is Array<string | FanExploreRecentSearch> =>
          Array.isArray(value),
      ) ??
      []);
  const recentSearches = items
    .map((item): NormalizedFanExploreRecentSearch | null => {
      if (typeof item === "string") {
        return {
          recentSearchId: null,
          keyword: item.trim(),
        };
      }

      const recentSearchId =
        item.recentSearchId ?? item.keywordId ?? item.id ?? null;
      const keyword = (
        item.keyword ??
        item.searchKeyword ??
        item.searchTerm ??
        item.searchWord ??
        item.query ??
        item.value ??
        ""
      ).trim();
      const normalizedRecentSearchId =
        typeof recentSearchId === "number"
          ? recentSearchId
          : typeof recentSearchId === "string"
            ? Number(recentSearchId)
            : null;

      return {
        recentSearchId: Number.isFinite(normalizedRecentSearchId)
          ? normalizedRecentSearchId
          : null,
        keyword,
      };
    })
    .filter((item): item is NormalizedFanExploreRecentSearch => {
      return item != null && item.keyword.length > 0;
    })
    .filter((item, index, items) => {
      return items.findIndex(({ keyword }) => keyword === item.keyword) === index;
    })
    .slice(0, 10);

  return {
    items: recentSearches,
    keywords: recentSearches.map(({ keyword }) => keyword),
  };
};

const normalizeBandDetail = (
  result: FanExploreBandDetail,
): FanExploreBandDetail => {
  const bandInfo =
    result.band ??
    result.profile ??
    result.bandProfile ??
    result.bandDetail ??
    result.bandInfo ??
    result.profileInfo ??
    result.detail ??
    {};

  return {
    ...bandInfo,
    ...result,
    bandId: result.bandId ?? bandInfo.bandId,
    id: result.id ?? bandInfo.id,
    name: result.name ?? result.nickname ?? bandInfo.name ?? bandInfo.nickname,
    bandName:
      result.bandName ?? result.name ?? bandInfo.bandName ?? bandInfo.name,
    genre: result.genre ?? result.bandGenre ?? bandInfo.genre ?? bandInfo.bandGenre,
    region:
      result.region ?? result.bandRegion ?? bandInfo.region ?? bandInfo.bandRegion,
    profileImageUrl:
      result.profileImageUrl ??
      result.profileImage ??
      result.imageUrl ??
      result.image ??
      result.thumbnailUrl ??
      bandInfo.profileImageUrl ??
      bandInfo.profileImage ??
      bandInfo.imageUrl ??
      bandInfo.image ??
      bandInfo.thumbnailUrl,
    bandProfileImageUrl:
      result.bandProfileImageUrl ?? bandInfo.bandProfileImageUrl,
    imageUrl: result.imageUrl ?? result.image ?? bandInfo.imageUrl ?? bandInfo.image,
    description:
      result.description ??
      result.bandDescription ??
      result.introduction ??
      result.introduce ??
      bandInfo.description ??
      bandInfo.bandDescription ??
      bandInfo.introduction ??
      bandInfo.introduce,
    introduction:
      result.introduction ??
      result.introduce ??
      bandInfo.introduction ??
      bandInfo.introduce,
    followerCount:
      result.followerCount ??
      result.followersCount ??
      result.followerCnt ??
      result.followCount ??
      result.followers ??
      bandInfo.followerCount ??
      bandInfo.followersCount ??
      bandInfo.followerCnt ??
      bandInfo.followCount ??
      bandInfo.followers,
    followers: result.followers ?? bandInfo.followers,
    isFollowing:
      result.isFollowing ??
      result.following ??
      result.followed ??
      bandInfo.isFollowing ??
      bandInfo.following ??
      bandInfo.followed,
    following: result.following ?? bandInfo.following,
    isOfficial: result.isOfficial ?? bandInfo.isOfficial,
    official: result.official ?? bandInfo.official,
    isLive: result.isLive ?? result.live ?? bandInfo.isLive ?? bandInfo.live,
    liveId: result.liveId ?? bandInfo.liveId,
  };
};

const toNumericId = (value?: number | string | null) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
};

const toStringArray = (value?: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(toStringArray);
  if (!value) return [];

  if (typeof value !== "string") {
    if (typeof value !== "object") return [];

    const record = value as Record<string, unknown>;
    return [
      record.url,
      record.mediaUrl,
      record.imageUrl,
      record.fileUrl,
      record.src,
      record.thumbnailUrl,
      record.thumbnailImageUrl,
      record.name,
      record.label,
      record.tagName,
      record.value,
    ].flatMap(toStringArray);
  }

  try {
    const parsedValue = JSON.parse(value) as unknown;
    if (Array.isArray(parsedValue) || typeof parsedValue === "object") {
      return toStringArray(parsedValue);
    }
  } catch {
    return value ? [value] : [];
  }

  return value ? [value] : [];
};

const normalizePostDetail = (
  result: FanExplorePostDetail,
): FanExplorePostDetail => {
  const rawResult = result as FanExplorePostDetail & FanExploreContentAlias;
  const nestedContent =
    typeof result.content === "object" && result.content != null
      ? result.content
      : undefined;
  const postInfo = (result.post ??
    nestedContent ??
    result.detail ??
    {}) as FanExplorePostDetail & FanExploreContentAlias;
  const bandInfo = result.band ?? postInfo.band;
  const mediaUrls = [
    ...toStringArray(result.mediaUrls ?? postInfo.mediaUrls),
    ...toStringArray(result.mediaUrl ?? postInfo.mediaUrl),
    ...toStringArray(rawResult.mediaUrlList ?? postInfo.mediaUrlList),
    ...toStringArray(rawResult.media ?? postInfo.media),
    ...toStringArray(rawResult.medias ?? postInfo.medias),
    ...toStringArray(rawResult.mediaList ?? postInfo.mediaList),
    ...toStringArray(rawResult.mediaFiles ?? postInfo.mediaFiles),
    ...toStringArray(result.imageUrls ?? postInfo.imageUrls),
    ...toStringArray(rawResult.imageUrlList ?? postInfo.imageUrlList),
    ...toStringArray(result.images ?? postInfo.images),
    ...toStringArray(result.imageUrl ?? postInfo.imageUrl),
    ...toStringArray(rawResult.postImages ?? postInfo.postImages),
    ...toStringArray(rawResult.postImageUrls ?? postInfo.postImageUrls),
    ...toStringArray(rawResult.postImageUrl ?? postInfo.postImageUrl),
    ...toStringArray(rawResult.contentImageUrls ?? postInfo.contentImageUrls),
    ...toStringArray(rawResult.contentImageUrl ?? postInfo.contentImageUrl),
    ...toStringArray(rawResult.mainImageUrl ?? postInfo.mainImageUrl),
  ];
  const fallbackMediaUrls = [
    ...toStringArray(result.thumbnailUrl ?? postInfo.thumbnailUrl),
    ...toStringArray(rawResult.thumbnailImageUrl ?? postInfo.thumbnailImageUrl),
    ...toStringArray(result.videoThumbnailUrl ?? postInfo.videoThumbnailUrl),
  ];
  const resolvedMediaUrls = mediaUrls.length > 0 ? mediaUrls : fallbackMediaUrls;
  const tags = [
    ...toStringArray(result.tags ?? postInfo.tags),
  ];

  return {
    ...postInfo,
    ...result,
    band: bandInfo,
    bandId:
      toNumericId(result.bandId) ??
      toNumericId(postInfo.bandId) ??
      toNumericId(bandInfo?.bandId) ??
      toNumericId(bandInfo?.id),
    bandName:
      result.bandName ??
      postInfo.bandName ??
      bandInfo?.bandName ??
      bandInfo?.name,
    genre: result.genre ?? postInfo.genre ?? bandInfo?.genre,
    region: result.region ?? postInfo.region ?? bandInfo?.region,
    profileImageUrl:
      result.profileImageUrl ??
      postInfo.profileImageUrl ??
      bandInfo?.profileImageUrl ??
      bandInfo?.bandProfileImageUrl ??
      bandInfo?.imageUrl,
    bandProfileImageUrl:
      result.bandProfileImageUrl ??
      postInfo.bandProfileImageUrl ??
      bandInfo?.bandProfileImageUrl,
    postId: result.postId ?? postInfo.postId,
    contentId: result.contentId ?? postInfo.contentId,
    id: result.id ?? postInfo.id,
    type: result.type ?? result.mediaType ?? result.contentType ?? postInfo.type,
    mediaType:
      result.mediaType ?? result.type ?? result.contentType ?? postInfo.mediaType,
    mediaUrls: resolvedMediaUrls,
    thumbnailUrl:
      result.thumbnailUrl ??
      result.videoThumbnailUrl ??
      rawResult.thumbnailImageUrl ??
      postInfo.thumbnailUrl ??
      postInfo.videoThumbnailUrl ??
      postInfo.thumbnailImageUrl,
    videoThumbnailUrl:
      result.videoThumbnailUrl ??
      result.thumbnailUrl ??
      rawResult.thumbnailImageUrl ??
      postInfo.videoThumbnailUrl ??
      postInfo.thumbnailUrl ??
      postInfo.thumbnailImageUrl,
    title: result.title ?? postInfo.title ?? rawResult.postTitle ?? postInfo.postTitle,
    contentText:
      result.contentText ??
      (typeof result.content === "string" ? result.content : null) ??
      rawResult.postContent ??
      result.body ??
      result.text ??
      rawResult.description ??
      postInfo.contentText ??
      (typeof postInfo.content === "string" ? postInfo.content : null) ??
      postInfo.postContent ??
      postInfo.body ??
      postInfo.text ??
      postInfo.description,
    tags,
    likeCount: result.likeCount ?? result.likes ?? postInfo.likeCount ?? postInfo.likes,
    commentCount:
      result.commentCount ?? result.comments ?? postInfo.commentCount ?? postInfo.comments,
    isLiked:
      result.isLiked ?? result.liked ?? postInfo.isLiked ?? postInfo.liked,
    createdAt: result.createdAt ?? postInfo.createdAt,
  };
};

const normalizePostLike = (
  result: FanExplorePostLikeResponse | null | undefined,
  intendedLiked: boolean,
): Required<Pick<FanExplorePostLikeResponse, "isLiked">> &
  Pick<FanExplorePostLikeResponse, "likeCount"> => {
  return {
    isLiked: result?.isLiked ?? result?.liked ?? intendedLiked,
    likeCount: result?.likeCount ?? result?.likes,
  };
};

const normalizeExploreContent = (
  result: FanExploreContent,
): FanExploreContent => {
  const rawResult = result as FanExploreContentAlias;
  const nestedContent =
    typeof result.content === "object" && result.content != null
      ? result.content
      : undefined;
  const postInfo = (result.post ??
    nestedContent ??
    result.detail ??
    {}) as FanExploreContentAlias;
  const bandInfo = (result.band ?? postInfo.band ?? {}) as FanExploreBand;
  const mediaUrls = [
    ...toStringArray(result.mediaUrls ?? postInfo.mediaUrls),
    ...toStringArray(result.mediaUrl ?? postInfo.mediaUrl),
    ...toStringArray(rawResult.mediaUrlList ?? postInfo.mediaUrlList),
    ...toStringArray(rawResult.media ?? postInfo.media),
    ...toStringArray(rawResult.medias ?? postInfo.medias),
    ...toStringArray(rawResult.mediaList ?? postInfo.mediaList),
    ...toStringArray(rawResult.mediaFiles ?? postInfo.mediaFiles),
    ...toStringArray(result.imageUrls ?? postInfo.imageUrls),
    ...toStringArray(rawResult.imageUrlList ?? postInfo.imageUrlList),
    ...toStringArray(result.images ?? postInfo.images),
    ...toStringArray(result.imageUrl ?? postInfo.imageUrl),
    ...toStringArray(rawResult.postImages ?? postInfo.postImages),
    ...toStringArray(rawResult.postImageUrls ?? postInfo.postImageUrls),
    ...toStringArray(rawResult.postImageUrl ?? postInfo.postImageUrl),
    ...toStringArray(rawResult.contentImageUrls ?? postInfo.contentImageUrls),
    ...toStringArray(rawResult.contentImageUrl ?? postInfo.contentImageUrl),
    ...toStringArray(rawResult.mainImageUrl ?? postInfo.mainImageUrl),
  ];
  const fallbackMediaUrls = [
    ...toStringArray(result.thumbnailUrl ?? postInfo.thumbnailUrl),
    ...toStringArray(rawResult.thumbnailImageUrl ?? postInfo.thumbnailImageUrl),
    ...toStringArray(result.videoThumbnailUrl ?? postInfo.videoThumbnailUrl),
  ];
  const resolvedMediaUrls = mediaUrls.length > 0 ? mediaUrls : fallbackMediaUrls;
  const tags = toStringArray(result.tags ?? postInfo.tags);
  const createdAt =
    result.createdAt ??
    postInfo.createdAt ??
    rawResult.postedAt ??
    postInfo.postedAt ??
    rawResult.uploadedAt ??
    postInfo.uploadedAt ??
    rawResult.registeredAt ??
    postInfo.registeredAt ??
    rawResult.createdDate ??
    postInfo.createdDate ??
    rawResult.createdTime ??
    postInfo.createdTime ??
    rawResult.updatedAt ??
    postInfo.updatedAt;

  return {
    ...postInfo,
    ...result,
    band: bandInfo,
    bandId: result.bandId ?? postInfo.bandId ?? bandInfo?.bandId,
    bandName:
      result.bandName ??
      postInfo.bandName ??
      bandInfo?.bandName ??
      bandInfo?.name,
    name: result.name ?? postInfo.name ?? bandInfo?.name ?? bandInfo?.bandName,
    genre:
      result.genre ??
      postInfo.genre ??
      rawResult.bandGenre ??
      postInfo.bandGenre ??
      bandInfo?.genre,
    region:
      result.region ??
      postInfo.region ??
      rawResult.bandRegion ??
      postInfo.bandRegion ??
      bandInfo?.region,
    profileImageUrl:
      result.profileImageUrl ??
      postInfo.profileImageUrl ??
      rawResult.profileImage ??
      postInfo.profileImage ??
      rawResult.bandImageUrl ??
      postInfo.bandImageUrl ??
      rawResult.bandProfileUrl ??
      postInfo.bandProfileUrl ??
      rawResult.avatarUrl ??
      postInfo.avatarUrl ??
      rawResult.logoUrl ??
      postInfo.logoUrl ??
      bandInfo?.profileImageUrl ??
      bandInfo?.bandProfileImageUrl ??
      bandInfo?.imageUrl,
    bandProfileImageUrl:
      result.bandProfileImageUrl ??
      postInfo.bandProfileImageUrl ??
      bandInfo?.bandProfileImageUrl,
    postId: result.postId ?? postInfo.postId,
    contentId: result.contentId ?? postInfo.contentId,
    id: result.id ?? postInfo.id,
    type: result.type ?? result.mediaType ?? result.contentType ?? postInfo.type,
    mediaType:
      result.mediaType ?? result.type ?? result.contentType ?? postInfo.mediaType,
    contentType:
      result.contentType ?? postInfo.contentType ?? result.mediaType ?? result.type,
    mediaUrls: resolvedMediaUrls,
    thumbnailUrl:
      result.thumbnailUrl ??
      result.videoThumbnailUrl ??
      rawResult.thumbnailImageUrl ??
      postInfo.thumbnailUrl ??
      postInfo.videoThumbnailUrl ??
      postInfo.thumbnailImageUrl,
    videoThumbnailUrl:
      result.videoThumbnailUrl ??
      result.thumbnailUrl ??
      rawResult.thumbnailImageUrl ??
      postInfo.videoThumbnailUrl ??
      postInfo.thumbnailUrl ??
      postInfo.thumbnailImageUrl,
    title: result.title ?? postInfo.title ?? rawResult.postTitle ?? postInfo.postTitle,
    content:
      (typeof result.content === "string" ? result.content : null) ??
      result.contentText ??
      rawResult.postContent ??
      result.body ??
      result.text ??
      rawResult.description ??
      (typeof postInfo.content === "string" ? postInfo.content : null) ??
      postInfo.contentText ??
      postInfo.postContent ??
      postInfo.body ??
      postInfo.text ??
      postInfo.description,
    contentText:
      result.contentText ??
      (typeof result.content === "string" ? result.content : null) ??
      rawResult.postContent ??
      result.body ??
      result.text ??
      rawResult.description ??
      postInfo.contentText ??
      (typeof postInfo.content === "string" ? postInfo.content : null) ??
      postInfo.postContent ??
      postInfo.body ??
      postInfo.text ??
      postInfo.description,
    tags,
    likeCount: result.likeCount ?? result.likes ?? postInfo.likeCount ?? postInfo.likes,
    commentCount:
      result.commentCount ?? result.comments ?? postInfo.commentCount ?? postInfo.comments,
    isLiked:
      result.isLiked ?? result.liked ?? postInfo.isLiked ?? postInfo.liked,
    createdAt,
  };
};

const removeEmptyParams = <T extends Record<string, unknown>>(params: T) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  );
};

export const getRecommendedExploreBands = async ({
  size = 20,
  cursor,
}: FanExploreRecommendationParams = {}): Promise<NormalizedFanExploreBandsResponse> => {
  const response = await axiosInstance.get<
    FanExploreApiResponse<FanExplorePageResponse<FanExploreBand> | FanExploreBand[]>
  >("/bands/recommendations", {
    params: removeEmptyParams({
      cursor,
      size,
    }),
  });

  return normalizeNumberCursorPage(assertSuccess(response), cursor);
};

export const getFanExploreBandDetail = async (
  bandId: number,
): Promise<FanExploreBandDetail> => {
  const response = await axiosInstance.get<
    FanExploreApiResponse<FanExploreBandDetail>
  >(`/bands/${bandId}/detail`);

  return normalizeBandDetail(assertSuccess(response));
};

export const getFanExplorePostDetail = async (
  postId: number,
): Promise<FanExplorePostDetail> => {
  const response = await axiosInstance.get<
    FanExploreApiResponse<FanExplorePostDetail>
  >(`/posts/${postId}/detail`);

  return normalizePostDetail(assertSuccess(response));
};

export const likeFanExplorePost = async (
  postId: number,
): Promise<
  Required<Pick<FanExplorePostLikeResponse, "isLiked">> &
    Pick<FanExplorePostLikeResponse, "likeCount">
> => {
  const response = await axiosInstance.post<
    FanExploreApiResponse<FanExplorePostLikeResponse>
  >(`/posts/${postId}/likes`);

  return normalizePostLike(assertMutationSuccess(response), true);
};

export const unlikeFanExplorePost = async (
  postId: number,
): Promise<
  Required<Pick<FanExplorePostLikeResponse, "isLiked">> &
    Pick<FanExplorePostLikeResponse, "likeCount">
> => {
  const response = await axiosInstance.delete<
    FanExploreApiResponse<FanExplorePostLikeResponse>
  >(`/posts/${postId}/likes`);
  return normalizePostLike(assertMutationSuccess(response), false);
};

export const searchFanExplore = async ({
  keyword,
  type = "ALL",
  sort = "ACCURACY",
  genre,
  region,
}: FanExploreSearchParams): Promise<NormalizedFanExploreSearchResponse> => {
  const response = await axiosInstance.get<
    FanExploreApiResponse<FanExploreSearchResponse>
  >("/explore/search", {
    params: removeEmptyParams({
      keyword,
      type,
      sort,
      genre,
      region,
    }),
  });
  const result = assertSuccess(response);
  const sections = result.sections ?? result.results ?? result;
  const bandSection =
    sections.bands ??
    sections.band ??
    sections.bandSection ??
    sections.bandResults ??
    sections.BAND;
  const performanceSection =
    sections.performances ??
    sections.performance ??
    sections.performanceSection ??
    sections.concerts ??
    sections.performanceResults ??
    sections.PERFORMANCE;
  const contentSection =
    sections.contents ??
    sections.posts ??
    sections.post ??
    sections.postSection ??
    sections.contentResults ??
    sections.POST;
  const bands = getSectionItems(bandSection);
  const performances = getSectionItems(performanceSection);
  const contents = getSectionItems(contentSection).map(normalizeExploreContent);

  return {
    bands,
    performances,
    contents,
    bandCount:
      result.bandCount ??
      result.totalBandCount ??
      sections.bandCount ??
      sections.totalBandCount ??
      getSectionCount(bandSection) ??
      bands.length,
    performanceCount:
      result.performanceCount ??
      result.concertCount ??
      result.totalPerformanceCount ??
      sections.performanceCount ??
      sections.concertCount ??
      sections.totalPerformanceCount ??
      getSectionCount(performanceSection) ??
      performances.length,
    contentCount:
      result.contentCount ??
      result.postCount ??
      result.totalContentCount ??
      sections.contentCount ??
      sections.postCount ??
      sections.totalContentCount ??
      getSectionCount(contentSection) ??
      contents.length,
  };
};

export const getFanExploreRecentSearches =
  async (): Promise<NormalizedFanExploreRecentSearchesResponse> => {
    const response = await axiosInstance.get<
      FanExploreApiResponse<
        | string[]
        | FanExploreRecentSearch[]
        | FanExplorePageResponse<string | FanExploreRecentSearch>
      >
    >("/explore/search/recent");

    return normalizeRecentSearches(assertSuccess(response));
  };

export const deleteFanExploreRecentSearch = async (recentSearchId: number) => {
  const response = await axiosInstance.delete<FanExploreApiResponse<null>>(
    `/explore/search/recent/${recentSearchId}`,
  );

  return assertMutationSuccess(response);
};

export const deleteAllFanExploreRecentSearches = async () => {
  const response = await axiosInstance.delete<FanExploreApiResponse<null>>(
    "/explore/search/recent",
  );

  return assertMutationSuccess(response);
};

export const searchFanExplorePerformances = async ({
  keyword,
  sort = "POPULAR",
  cursor,
  size = 20,
  genre,
  region,
}: FanExploreSearchParams): Promise<NormalizedFanExplorePerformancesResponse> => {
  const response = await axiosInstance.get<
    FanExploreApiResponse<
      FanExplorePageResponse<FanExplorePerformance> | FanExplorePerformance[]
    >
  >("/explore/search", {
    params: removeEmptyParams({
      keyword,
      type: "PERFORMANCE",
      sort,
      genre,
      region,
      cursor,
      size,
    }),
  });

  return normalizeCursorPage(
    assertSuccess(response),
    cursor,
    PERFORMANCE_SECTION_KEYS,
  );
};

export const searchFanExploreContents = async ({
  keyword,
  sort = "POPULAR",
  cursor,
  size = 20,
  genre,
  region,
}: FanExploreSearchParams): Promise<NormalizedFanExploreContentsResponse> => {
  const response = await axiosInstance.get<
    FanExploreApiResponse<FanExplorePageResponse<FanExploreContent> | FanExploreContent[]>
  >("/explore/search", {
    params: removeEmptyParams({
      keyword,
      type: "POST",
      sort,
      genre,
      region,
      cursor,
      size,
    }),
  });

  const normalized = normalizeCursorPage(
    assertSuccess(response),
    cursor,
    CONTENT_SECTION_KEYS,
  );

  return {
    ...normalized,
    items: normalized.items.map(normalizeExploreContent),
  };
};

export const followExploreBand = async (bandId: number) => {
  const response = await axiosInstance.post<FanExploreApiResponse<null>>(
    `/bands/${bandId}/follow`,
  );

  return assertMutationSuccess(response);
};

export const unfollowExploreBand = async (bandId: number) => {
  const response = await axiosInstance.delete<FanExploreApiResponse<null>>(
    `/bands/${bandId}/follow`,
  );

  return assertMutationSuccess(response);
};
