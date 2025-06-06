import { HeartIcon, StarIcon } from "@heroicons/react/16/solid";
import type { ReactNode } from "react";
import { studentImageUrl } from "~/models/assets";

type StudentCardProps = {
  uid: string | null;
  name?: string | null;
  nameSize?: "small" | "normal";

  tier?: number | null;
  level?: number | null;
  label?: ReactNode;
  isAssist?: boolean;

  favorited?: boolean;
  favoritedCount?: number;
  grayscale?: boolean;
}

function visibileTier(tier: number): [number, boolean] {
  if (tier <= 5) {
    return [tier, false];
  } else {
    return [tier - 5, true];
  }
}

export default function StudentCard(
  { uid, name, nameSize, tier, level, label, isAssist, favorited, favoritedCount, grayscale }: StudentCardProps,
) {
  const visibleNames = [];
  if (name === "하츠네 미쿠") {
    visibleNames.push("미쿠");
  } else if (name === "미사카 미코토") {
    visibleNames.push("미사카");
  } else if (name === "쇼쿠호 미사키") {
    visibleNames.push("쇼쿠호");
  } else if (name === "사텐 루이코") {
    visibleNames.push("사텐");
  } else if (name === "시로코*테러") {
    visibleNames.push("시로코", "테러");
  } else if (name?.includes("(")) {
    const splits = name.split("(");
    visibleNames.push(splits[0], splits[1].replace(")", ""));
  } else if (name) {
    visibleNames.push(name);
  }

  return (
    <div className="my-1">
      <div className="relative">
        <img
          className={`rounded-lg ${grayscale ? "grayscale opacity-75" : ""} transition`}
          src={studentImageUrl(uid ?? "unlisted")}
          alt={name ?? undefined} loading="lazy"
        />
        {/* 우측 상단 */}
        <div className="absolute top-0 right-0 text-xs font-bold">
          {level && <span className="px-1.5 bg-black/90 rounded-lg text-neutral-100">Lv. {level}</span>}
        </div>

        {(favoritedCount || favorited) && (
          <div className={`px-1 absolute top-0.5 right-0.5 text-white border rounded-lg flex items-center transition ${(favorited === undefined || favorited === true) ? "bg-red-500/90" : "bg-neutral-500/90"}`}>
            <HeartIcon className="size-3.5" />
            {favoritedCount && <span className="text-xs font-bold">{favoritedCount}</span>}
          </div>
        )}

        {/* 하단 */}
        <div className="absolute bottom-0 w-full flex justify-center text-xs font-bold bg-black/90 rounded-b-lg">
          {isAssist && (
            <div className="px-1 md:px-1.5 text-xs font-bold bg-linear-to-br from-cyan-300 to-sky-500 dark:from-cyan-400 dark:to-sky-600 text-white rounded-bl-lg text-center">A</div>
          )}
          {label}
          {!label && tier && (
            <div className={`flex-grow flex justify-center items-center ${visibileTier(tier)[1] ? "text-teal-300" : "text-yellow-300"}`}>
              {(tier <= 5) ?
                <StarIcon className="size-3.5 mr-0.5 inline-block" /> :
                <img className="w-4 h-4 mr-0.5 inline-block" src="/icons/exclusive_weapon.png" alt="고유 장비" />
              }
              <span>{visibileTier(tier)[0]}</span>
            </div>
          )}
        </div>
      </div>
      {name && (
        <div className="mt-1 text-center leading-tight tracking-tighter">
          <p className={nameSize === "small" ? "text-xs" : "text-sm"}>{visibleNames[0]}</p>
          {(visibleNames.length === 2) && <p className="text-xs">{visibleNames[1]}</p>}
        </div>
      )}
    </div>
  )
}
