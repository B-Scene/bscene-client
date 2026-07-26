import { useMutation } from "@tanstack/react-query";
import { uploadMediaFile } from "@/utils/uploadMediaFile";
import type { MediaCategory } from "@/types/media/presignedUrl";

export const useUploadMediaFile = () => {
  return useMutation({
    mutationFn: ({ file, category }: { file: File; category: MediaCategory }) =>
      uploadMediaFile(file, category),
  });
};
