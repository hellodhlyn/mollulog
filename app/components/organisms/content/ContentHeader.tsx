import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useState } from "react";
import YouTube from "react-youtube";
import { MultilineText } from "~/components/atoms/typography";

type ContentHeaderProps = {
  name: string;
  type: string;
  since: Dayjs;
  until: Dayjs;

  image: string | null;
  videos: {
    youtube: string;
    start: number | null;
  }[] | null;
};

export default function ContentHeader(
  { name, type, since, until, image, videos }: ContentHeaderProps,
) {
  const [videoPlaying, setVideoPlaying] = useState(false);

  let dDayText = "";
  const now = dayjs();
  if (now.isAfter(until)) {
    dDayText = "개최 종료";
  } else if (now.isAfter(since)) {
    dDayText = "개최중";
  } else {
    const daysDiff = since.startOf("day").diff(now.startOf("day"), "day");
    dDayText = (daysDiff === 0) ? "오늘" : `D-${daysDiff}`;
  }

  if (!image) {
    return (
      <div>
        <p className="text-sm md:text-base text-neutral-500">{type}</p>
        <MultilineText className="text-lg md:text-2xl font-bold" texts={name.split("\n")} />
        <div className="flex items-end">
          <p className="grow text-sm md:text-base">
            {dayjs(since).format("YYYY-MM-DD")} ~ {dayjs(until).format("YYYY-MM-DD")}
          </p>
          <p className="py-1 px-4 flex-none bg-neutral-900 text-white text-xs md:text-sm rounded-full">{dDayText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen md:w-full -mx-4 md:mx-0 aspect-video">
      <div className="relative w-full h-full">
        {(videos && videos.length > 0) && (
          <YouTube
            videoId={videos[0].youtube}
            className="absolute w-full aspect-video"
            iframeClassName="w-full h-full md:rounded-xl"
            opts={{
              playerVars: {
                autoplay: 1, mute: 1, controls: 0, rel: 0, start: videos[0].start ?? 0,
              }
            }}
            onPlay={(ytEvent) => {
              setVideoPlaying(true);
              setTimeout(
                () => { setVideoPlaying(false); },
                (ytEvent.target.getDuration() - (videos![0].start ?? 0) - 1.0) * 1000,
              );
            }}
            onEnd={() => setVideoPlaying(false)}
          />
        )}
        <img
          className={`absolute w-full md:rounded-xl ${videoPlaying ? "opacity-0" : "opacity-100"} ease-in duration-500 transition-opacity`}
          src={image} alt={`${name} 이벤트 이미지`}
        />
      </div>
      <div className="absolute bottom-0 w-full px-4 md:px-6 py-4 text-white bg-gradient-to-t from-neutral-900/75 from-75% md:rounded-b-xl">
        <p className="text-sm md:text-base text-neutral-300">{type}</p>
        <MultilineText className="text-lg md:text-2xl font-bold" texts={name.split("\n")} />
        <div className="flex items-end">
          <p className="grow text-sm md:text-base">
            {dayjs(since).format("YYYY-MM-DD")} ~ {dayjs(until).format("YYYY-MM-DD")}
          </p>
          <p className="py-1 px-4 flex-none bg-neutral-900 bg-opacity-75 text-xs md:text-sm rounded-full">{dDayText}</p>
        </div>
      </div>
    </div>
  );
}
