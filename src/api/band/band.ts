import { axiosInstance } from "@/api/axiosInstance";
import type {
  BandApiResponse,
  BandDetailResponse,
  CheckBandNameResponse,
  CreateBandRequest,
  CreateBandResponse,
  UpdateBandRequest,
  UpdateBandResponse,
} from "@/types/band/band";

export const createBand = async (body: CreateBandRequest) => {
  const { data } = await axiosInstance.post<
    BandApiResponse<CreateBandResponse>
  >("/bands", body);

  return data.result;
};

export const checkBandName = async (name: string) => {
  const { data } = await axiosInstance.get<
    BandApiResponse<CheckBandNameResponse>
  >("/bands/check-name", {
    params: { name },
  });

  return data.result;
};

export const getBand = async (bandId: number) => {
  const { data } = await axiosInstance.get<
    BandApiResponse<BandDetailResponse>
  >(`/bands/${bandId}`);

  return data.result;
};

export const updateBand = async (bandId: number, body: UpdateBandRequest) => {
  const { data } = await axiosInstance.patch<
    BandApiResponse<UpdateBandResponse>
  >(`/bands/${bandId}`, body);

  return data.result;
};
