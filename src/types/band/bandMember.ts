import type { BandGenre, BandRegion } from "@/types/band/band";

export interface BandApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type BandMemberType = "MEMBER" | "SESSION";

export interface InviteBandMemberRequest {
  userId: number;
  memberType: BandMemberType;
}

export interface BandMemberResponse {
  id: number;
  bandId: number;
  userId: number;
  bandMemberProfileId: number | null;
  profileNickname: string | null;
  part: BandMemberPart | null;
  owner: boolean;
  memberType: BandMemberType;
  status: string;
  createdAt: string;
}

export type InviteBandMemberResponse = BandMemberResponse;

export type BandMemberPart =
  | "VOCAL"
  | "GUITAR"
  | "BASS"
  | "KEYBOARD"
  | "DRUM"
  | "ETC";

export interface AcceptBandInviteRequest {
  nickname: string;
  part: BandMemberPart;
}

export interface AcceptBandInviteResponse {
  bandId: number;
  bandMemberProfileId: number;
  nickname: string;
  status: string;
}

export interface BandMemberSearchItem {
  userId: number;
  nickname: string;
  bandMemberStatus: string | null;
  inviteAvailable: boolean;
}

export type BandMemberListItem = BandMemberResponse;

export interface CreateBandInviteLinkRequest {
  memberType: BandMemberType;
}

export interface BandInviteLinkResponse {
  bandId: number;
  memberType: BandMemberType;
  token: string;
  expiresAt: string;
}

export interface BandInviteLinkInfoResponse {
  bandId: number;
  bandName: string;
  bandProfileImageUrl: string | null;
  genre: BandGenre;
  region: BandRegion;
  memberType: BandMemberType;
  expiresAt: string;
}

export interface EnterBandInviteLinkResponse {
  bandMemberId: number;
  bandId: number;
  memberType: BandMemberType;
  status: string;
}
