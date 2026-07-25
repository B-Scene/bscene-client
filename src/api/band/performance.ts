import { axiosInstance } from "@/api/axiosInstance";
import type {
  BandApiResponse,
  CreatePerformanceRequest,
  CreatePerformanceResponse,
  PerformanceListResponse,
  PerformanceResponse,
  UpdatePerformanceRequest,
  UpdatePerformanceResponse,
} from "@/types/band/performance";

export const createPerformance = async (
  bandId: number,
  body: CreatePerformanceRequest,
) => {
  const { data } = await axiosInstance.post<
    BandApiResponse<CreatePerformanceResponse>
  >(`/bands/${bandId}/performances`, body);

  return data.result;
};

export const getPerformances = async (bandId: number) => {
  const { data } = await axiosInstance.get<
    BandApiResponse<PerformanceListResponse>
  >(`/bands/${bandId}/performances`);

  return data.result;
};

export const getPerformance = async (performanceId: number) => {
  const { data } = await axiosInstance.get<
    BandApiResponse<PerformanceResponse>
  >(`/performances/${performanceId}`);

  return data.result;
};

export const deletePerformance = async (performanceId: number) => {
  const { data } = await axiosInstance.delete<BandApiResponse<null>>(
    `/performances/${performanceId}`,
  );

  return data.result;
};

export const updatePerformance = async (
  performanceId: number,
  body: UpdatePerformanceRequest,
) => {
  const { data } = await axiosInstance.patch<
    BandApiResponse<UpdatePerformanceResponse>
  >(`/performances/${performanceId}`, body);

  return data.result;
};
