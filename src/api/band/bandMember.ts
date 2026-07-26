import { axiosInstance } from "@/api/axiosInstance";
import type {
  AcceptBandInviteRequest,
  AcceptBandInviteResponse,
  BandApiResponse,
  BandMemberListItem,
  BandMemberSearchItem,
  InviteBandMemberRequest,
  InviteBandMemberResponse,
} from "@/types/band/bandMember";

export const inviteBandMember = async (
  bandId: number,
  body: InviteBandMemberRequest,
) => {
  const { data } = await axiosInstance.post<
    BandApiResponse<InviteBandMemberResponse>
  >(`/bands/${bandId}/members`, body);

  return data.result;
};

export const getBandMembers = async (bandId: number) => {
  const { data } = await axiosInstance.get<
    BandApiResponse<BandMemberListItem[]>
  >(`/bands/${bandId}/members`);

  return data.result;
};

export const acceptBandInvite = async (
  bandId: number,
  body: AcceptBandInviteRequest,
) => {
  const { data } = await axiosInstance.patch<
    BandApiResponse<AcceptBandInviteResponse>
  >(`/bands/${bandId}/members/accept`, body);

  return data.result;
};

export const rejectBandInvite = async (bandId: number) => {
  const { data } = await axiosInstance.delete<BandApiResponse<null>>(
    `/bands/${bandId}/members/reject`,
  );

  return data.result;
};

export const removeBandMember = async (bandId: number, userId: number) => {
  const { data } = await axiosInstance.delete<BandApiResponse<null>>(
    `/bands/${bandId}/members/${userId}`,
  );

  return data.result;
};

export const searchBandMemberCandidates = async (
  bandId: number,
  keyword: string,
) => {
  const { data } = await axiosInstance.get<
    BandApiResponse<BandMemberSearchItem[]>
  >(`/bands/${bandId}/members/search`, {
    params: { keyword },
  });

  return data.result;
};
