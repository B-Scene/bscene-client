import GalleryIcon from "@/assets/icons/band/gallery.svg";
import CameraIcon from "@/assets/icons/band/camera.svg";
import DeleteIcon from "@/assets/icons/band/delete-profile-image.svg";

interface ImagePickerSheetProps {
  open: boolean;
  onClose: () => void;
  onSelectGallery: () => void;
  onSelectCamera: () => void;
  onDelete: () => void;
}

export const ImagePickerSheet = ({
  open,
  onClose,
  onSelectGallery,
  onSelectCamera,
  onDelete,
}: ImagePickerSheetProps) => {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute top-full left-1/2 z-50 mt-3 w-40 -translate-x-1/2 rounded-3xl bg-[rgba(250,250,250,0.70)] px-4 py-5 shadow-[0_8px_40px_0_rgba(0,0,0,0.12)] backdrop-blur-md">
        <div className="flex flex-col gap-4 pl-2">
          <button
            type="button"
            onClick={onSelectGallery}
            className="flex w-full items-center gap-2 text-left text-body1 text-neutral-900"
          >
            <img src={GalleryIcon} alt="" />
            사진 보관함
          </button>

          <button
            type="button"
            onClick={onSelectCamera}
            className="flex w-full items-center gap-2 text-left text-body1 text-neutral-900"
          >
            <img src={CameraIcon} alt="" />
            사진 찍기
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center gap-2 text-left text-body1 text-error"
          >
            <img src={DeleteIcon} alt="" />
            삭제
          </button>
        </div>
      </div>
    </>
  );
};
