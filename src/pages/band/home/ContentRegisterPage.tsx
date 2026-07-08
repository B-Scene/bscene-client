import {
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/band/home/Header";
import { Input } from "@/components/common/Input/Input";
import UploadIcon from "@/assets/icons/band/upload.svg";
import CloseCircleIcon from "@/assets/icons/band/close-circle.svg";
import CloseIcon from "@/assets/icons/close.svg";
import PlayButtonIcon from "@/assets/icons/band/play-button.svg";

const CONTENT_TYPES = ["사진", "글", "영상"] as const;
type ContentType = (typeof CONTENT_TYPES)[number];

const MAX_IMAGES = 10;
const MAX_TAGS = 8;
const DESCRIPTION_MAX_LENGTH = 500;

const hasBatchim = (text: string) => {
  const lastChar = text.trim().slice(-1);
  const code = lastChar.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return false;
  return code % 28 !== 0;
};

interface FieldProps {
  label: string;
  required?: boolean;
  error?: boolean;
  children: ReactNode;
}

const Field = ({ label, required, error, children }: FieldProps) => (
  <div className="flex flex-col gap-2">
    <label className="text-body1 text-neutral-900">
      {label}{" "}
      {required ? <span className="text-body1 text-error">*</span> : null}
    </label>
    {children}
    {error ? (
      <span className="text-body5 text-error">
        {label}
        {hasBatchim(label) ? "은" : "는"} 필수 항목이에요
      </span>
    ) : null}
  </div>
);

interface ImageFile {
  id: string;
  url: string;
}

interface VideoFile {
  name: string;
  size: string;
  url: string;
}

const formatFileSize = (bytes: number) =>
  `${Math.round(bytes / 1024 / 1024)} MB`;

const ContentRegisterPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [video, setVideo] = useState<VideoFile | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [showErrors, setShowErrors] = useState(false);

  const isValid = Boolean(contentType && title.trim());

  const contentTypeError = showErrors && !contentType;
  const titleError = showErrors && !title.trim();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const isVideo = files[0].type.startsWith("video/");

    if (isVideo) {
      const file = files[0];
      setVideo((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return {
          name: file.name,
          size: formatFileSize(file.size),
          url: URL.createObjectURL(file),
        };
      });
      setContentType("영상");
    } else {
      const newImages = Array.from(files)
        .slice(0, MAX_IMAGES - images.length)
        .map((file) => ({
          id: crypto.randomUUID(),
          url: URL.createObjectURL(file),
        }));
      setImages((prev) => [...prev, ...newImages]);
      setContentType((prev) => prev ?? "사진");
    }

    event.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((image) => image.id !== id);
    });
  };

  const handleRemoveVideo = () => {
    if (video) URL.revokeObjectURL(video.url);
    setVideo(null);
  };

  const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const trimmed = tagInput.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= MAX_TAGS) return;

    setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleSubmit = () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    navigate("/band/register/complete", {
      state: {
        title: "콘텐츠가 업로드됐어요",
        description: "콘텐츠 탭에서 확인할 수 있어요",
        rows: [
          { label: "콘텐츠", value: contentType ?? "" },
          { label: "콘텐츠 제목", value: title },
        ],
        primaryLabel: "콘텐츠 보기",
        primaryTo: "/band/home",
      },
    });
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-40">
      <Header title="콘텐츠 등록" />

      <section className="flex flex-col gap-6 px-8 pt-6">
        <div className="flex flex-col gap-3">
          {video ? (
            <div className="flex items-center gap-19.75 rounded-xl border border-neutral-400 bg-neutral-200 px-3 py-3.25">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative flex h-15 w-27 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-300">
                  <video
                    src={video.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 size-full object-cover"
                  />
                  <img
                    src={PlayButtonIcon}
                    alt=""
                    className="relative size-6"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-caption3 text-neutral-900">
                    {video.name}
                  </span>
                  <span className="text-body5 text-neutral-500">
                    {video.size} · 선택 완료
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveVideo}
                aria-label="파일 삭제"
                className="flex size-6 shrink-0 items-center justify-center"
              >
                <img src={CloseIcon} alt="" className="size-3.5" />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-secondary-300 bg-secondary-0 px-23.5 py-8.75"
              >
                <img src={UploadIcon} alt="" className="size-9" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-body1 text-neutral-900">파일 선택</span>
                  <div className="flex flex-col items-center">
                    <span className="text-center text-caption2 text-neutral-500">
                      JPG · PNG · MP4 · MOV
                    </span>
                    <span className="text-center text-caption2 text-neutral-500">
                      최대 500MB
                    </span>
                  </div>
                </div>
              </button>

              {images.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((image) => (
                      <div key={image.id} className="relative size-13 shrink-0">
                        <img
                          src={image.url}
                          alt=""
                          className="size-13 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(image.id)}
                          aria-label="사진 삭제"
                          className="absolute -top-1 -right-1"
                        >
                          <img
                            src={CloseCircleIcon}
                            alt=""
                            className="size-4"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                  <span className="text-caption4 text-neutral-600">
                    사진은 최대 {MAX_IMAGES}장까지 첨부할 수 있어요
                  </span>
                </div>
              ) : null}
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex flex-col gap-4">
          <Field label="콘텐츠" required error={contentTypeError}>
            <div className="flex gap-2">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setContentType(type)}
                  className={`flex h-6.5 w-14 shrink-0 items-center justify-center gap-2.5 rounded-lg px-3.75 py-1.75 text-center text-caption3 ${
                    contentType === type
                      ? "bg-secondary-500 text-neutral-0"
                      : contentTypeError
                        ? "border border-error text-error"
                        : "bg-neutral-300 text-neutral-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </Field>

          <Field label="콘텐츠 제목" required error={titleError}>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="콘텐츠 제목을 입력하세요"
              error={titleError}
              className="w-full rounded-[5px] px-4 py-1.25"
            />
          </Field>

          <Field label="설명">
            <div className="flex h-15 w-full flex-col rounded-[5px] border border-neutral-400 bg-neutral-0 pt-1.5 pr-3.25 pb-2 pl-4 focus-within:border-secondary-500">
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value.slice(0, DESCRIPTION_MAX_LENGTH),
                  )
                }
                placeholder="콘텐츠에 대한 설명을 입력하세요"
                maxLength={DESCRIPTION_MAX_LENGTH}
                className="w-full flex-1 resize-none bg-transparent text-caption2 text-neutral-900 outline-none placeholder:text-caption2 placeholder:text-neutral-500"
              />
              <span className="self-end text-caption4 text-neutral-400">
                {description.length}/{DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
          </Field>

          <Field label={`태그 (최대 ${MAX_TAGS}개)`}>
            <div className="flex flex-col gap-2.5">
              <Input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="태그를 입력해주세요"
                disabled={tags.length >= MAX_TAGS}
                className="w-full rounded-[5px] px-4 py-1.25"
              />

              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex h-6.5 shrink-0 items-center justify-center gap-2 rounded-full bg-secondary-100 px-3.75 py-1.75 text-center text-caption3 text-secondary-500"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`${tag} 태그 삭제`}
                      >
                        <img src={CloseIcon} alt="" className="size-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Field>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+16px)] px-5">
        <button
          type="button"
          onClick={handleSubmit}
          className={`flex h-13 w-full items-center justify-center rounded-xl text-label1 ${
            isValid
              ? "bg-secondary-500 text-neutral-0"
              : "bg-neutral-300 text-neutral-600"
          }`}
        >
          콘텐츠 등록
        </button>
      </div>
    </main>
  );
};

export default ContentRegisterPage;
