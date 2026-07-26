import { useQuery } from "@tanstack/react-query";
import { getBandMyPage } from "@/api/user/bandMyPage";

export const bandMyPageKeys = {
  all: ["bandMyPage"] as const,
};

export const useBandMyPageQuery = () => {
  return useQuery({
    queryKey: bandMyPageKeys.all,
    queryFn: getBandMyPage,
  });
};
