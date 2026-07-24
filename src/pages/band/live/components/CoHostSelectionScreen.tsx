import UserDefaultProfileIcon from "@/assets/icons/band/user-default-profile.svg";
import { members } from "../data";
import { TopBar } from "./TopBar";

interface CoHostSelectionScreenProps {
  onBack: () => void;
  onClose: () => void;
}

export function CoHostSelectionScreen({
  onBack,
  onClose,
}: CoHostSelectionScreenProps) {
  return (
    <main className="min-h-dvh bg-neutral-0 text-neutral-900">
      <TopBar title="공동 진행" onBack={onBack} onClose={onClose} />

      <section className="px-9 pt-6 pb-8">
        <div className="grid gap-4">
          {members.map((member, index) => {
            const isHost = index === 0;

            return (
              <article
                key={member.id}
                className="flex items-center rounded-[14px] bg-neutral-0 px-5 py-4 shadow-[0_4px_15px_rgba(20,20,20,0.08)]"
              >
                <img
                  src={UserDefaultProfileIcon}
                  alt=""
                  className="size-12 shrink-0 rounded-full object-cover"
                />

                <div className="ml-4 min-w-0 flex-1">
                  <strong className="block truncate text-body1 font-semibold text-neutral-900">
                    {member.name}
                  </strong>
                  <p className="mt-1 text-caption2 text-neutral-600">
                    {member.role.replace("밴드 · ", "")}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isHost}
                  className={
                    isHost
                      ? "shrink-0 text-body2 font-semibold text-neutral-900"
                      : "shrink-0 text-body2 font-semibold text-error"
                  }
                >
                  {isHost ? "진행자" : "초대"}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}