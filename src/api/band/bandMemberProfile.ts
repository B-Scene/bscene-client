import { axiosInstance } from "@/api/axiosInstance";
import type {
  BandApiResponse,
  BandMemberProfileResponse,
  CreateBandMemberProfileRequest,
  CreateBandMemberProfileResponse,
  UpdateBandMemberProfileRequest,
  UpdateBandMemberProfileResponse,
} from "@/types/band/bandMemberProfile";

export const getBandMemberProfiles = async () => {
  const { data } = await axiosInstance.get<
    BandApiResponse<BandMemberProfileResponse[]>
  >("/band-member-profiles");

  return data.result;
};

export const getBandMemberProfile = async (profileId: number) => {
  const { data } = await axiosInstance.get<
    BandApiResponse<BandMemberProfileResponse>
  >(`/band-member-profiles/${profileId}`);

  return data.result;
};

export const getActiveBandMemberProfile = async () => {
  const { data } = await axiosInstance.get<
    BandApiResponse<BandMemberProfileResponse>
  >("/band-member-profiles/active");

  return data.result;
};

export const createBandMemberProfile = async (
  body: CreateBandMemberProfileRequest,
) => {
  const { data } = await axiosInstance.post<
    BandApiResponse<CreateBandMemberProfileResponse>
  >("/band-member-profiles", body);

  return data.result;
};

export const updateBandMemberProfile = async (
  profileId: number,
  body: UpdateBandMemberProfileRequest,
) => {
  const { data } = await axiosInstance.patch<
    BandApiResponse<UpdateBandMemberProfileResponse>
  >(`/band-member-profiles/${profileId}`, body);

  return data.result;
};

export const deleteBandMemberProfile = async (profileId: number) => {
  const { data } = await axiosInstance.delete<BandApiResponse<null>>(
    `/band-member-profiles/${profileId}`,
  );

  return data.result;
};

export const activateBandMemberProfile = async (profileId: number) => {
  const { data } = await axiosInstance.patch<
    BandApiResponse<BandMemberProfileResponse>
  >(`/band-member-profiles/${profileId}/activate`);

  return data.result;
};
