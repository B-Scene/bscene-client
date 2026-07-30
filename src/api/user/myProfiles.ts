import { axiosInstance } from "@/api/axiosInstance";
import type {
  GetMyProfilesParams,
  MyBandProfileSummary,
  MyFanProfileSummary,
  MyProfilesResponse,
} from "@/types/user/myProfiles";

type ApiResponse<T> = {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T | null;
  timeStamp: string;
};

type RawRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toRecord = (value: unknown): RawRecord => (isRecord(value) ? value : {});

const pick = (record: RawRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
};

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const toText = (value: unknown, fallback = "") => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
};

const toNullableText = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  return null;
};

const toBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return false;
};

const getArray = (value: unknown): unknown[] | null => {
  if (Array.isArray(value)) {
    return value;
  }

  const record = toRecord(value);

  for (const key of [
    "items",
    "content",
    "data",
    "list",
    "results",
    "profiles",
    "bandProfiles",
    "bands",
  ]) {
    if (Array.isArray(record[key])) {
      return record[key];
    }
  }

  return null;
};

const pickArray = (record: RawRecord, keys: string[]) => {
  for (const key of keys) {
    const array = getArray(record[key]);

    if (array) {
      return array;
    }
  }

  return Object.values(record).find((value): value is unknown[] =>
    Array.isArray(value),
  );
};

const normalizeBandProfile = (value: unknown): MyBandProfileSummary | null => {
  const record = toRecord(value);
  const band = toRecord(record.band);
  const profile = toRecord(record.profile);
  const bandId =
    toNumber(pick(record, ["bandId"])) ??
    toNumber(pick(band, ["bandId", "id"])) ??
    toNumber(pick(record, ["id"]));
  const bandMemberProfileId =
    toNumber(
      pick(record, [
        "bandMemberProfileId",
        "bandProfileId",
        "profileId",
        "memberProfileId",
        "bandMemberId",
      ]),
    ) ??
    toNumber(pick(profile, ["bandMemberProfileId", "profileId", "id"])) ??
    bandId;
  const resolvedBandId = bandId ?? bandMemberProfileId;

  if (resolvedBandId === null || bandMemberProfileId === null) {
    return null;
  }

  return {
    bandId: resolvedBandId,
    bandMemberProfileId,
    profileImageUrl: toNullableText(
      pick(record, [
        "profileImageUrl",
        "bandProfileImageUrl",
        "imageUrl",
        "profileImage",
        "avatarUrl",
        "logoUrl",
      ]) ?? pick(band, ["profileImageUrl", "imageUrl", "profileImage"]),
    ),
    bandName: toText(
      pick(record, ["bandName", "name", "nickname"]) ??
        pick(band, ["bandName", "name"]),
      "밴드",
    ),
    genre: toText(
      pick(record, ["genre", "bandGenre"]) ?? pick(band, ["genre", "bandGenre"]),
    ),
    region: toText(
      pick(record, ["region", "bandRegion"]) ??
        pick(band, ["region", "bandRegion"]),
    ),
    isActive: toBoolean(pick(record, ["isActive", "active", "current"])),
  };
};

const normalizeFanProfile = (value: unknown): MyFanProfileSummary | null => {
  const record = toRecord(value);
  const fanProfileId = toNumber(
    pick(record, ["fanProfileId", "profileId", "userProfileId", "id"]),
  );

  if (fanProfileId === null) {
    return null;
  }

  return {
    fanProfileId,
    profileImageUrl: toNullableText(
      pick(record, ["profileImageUrl", "imageUrl", "profileImage", "avatarUrl"]),
    ),
    nickname: toText(pick(record, ["nickname", "name", "fanNickname"])),
    email: toText(pick(record, ["email", "loginId"])),
    isActive: toBoolean(pick(record, ["isActive", "active", "current"])),
  };
};

const normalizeMyProfiles = (result: unknown): MyProfilesResponse => {
  const record = toRecord(result);
  const singleBandProfile = pick(record, [
    "bandProfile",
    "bandAccount",
    "bandMemberProfile",
  ]);
  const bandProfiles = (
    Array.isArray(result)
      ? result
      : (pickArray(record, [
            "bandProfiles",
            "bands",
            "bandProfileList",
            "bandMemberProfiles",
            "bandAccounts",
            "items",
            "content",
            "data",
            "list",
            "results",
          ]) ??
          (isRecord(singleBandProfile) ? [singleBandProfile] : []))
  )
    .map(normalizeBandProfile)
    .filter((profile): profile is MyBandProfileSummary => profile !== null);
  const fanProfile = normalizeFanProfile(
    pick(record, ["fanProfile", "fan", "fanAccount", "profile"]),
  );

  return {
    bandProfiles,
    fanProfile,
  };
};

export const getMyProfiles = async (
  params: GetMyProfilesParams = {},
): Promise<MyProfilesResponse> => {
  const { data } = await axiosInstance.get<ApiResponse<unknown>>(
    "/users/me/profiles",
    { params },
  );

  if (data.isSuccess === false) {
    throw new Error(data.message || "프로필 목록을 조회하지 못했어요.");
  }

  return normalizeMyProfiles(data.result);
};
