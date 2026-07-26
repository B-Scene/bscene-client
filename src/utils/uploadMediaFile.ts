import axios from "axios";
import { getPresignedUrl } from "@/api/media/presignedUrl";
import type { MediaCategory } from "@/types/media/presignedUrl";

export const uploadMediaFile = async (file: File, category: MediaCategory) => {
  const { presignedUrl, fileUrl } = await getPresignedUrl({
    category,
    fileName: file.name,
    contentType: file.type,
  });

  await axios.put(presignedUrl, file, {
    headers: { "Content-Type": file.type },
  });

  return fileUrl;
};
