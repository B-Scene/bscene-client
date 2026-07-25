import { useQuery } from "@tanstack/react-query";
import { getFanMyPage } from "@/api/user/myPage";

export const fanMyPageKeys = {
  all: ["fanMyPage"] as const,
};

export const useFanMyPageQuery = () => {
  return useQuery({
    queryKey: fanMyPageKeys.all,
    queryFn: getFanMyPage,
  });
};
