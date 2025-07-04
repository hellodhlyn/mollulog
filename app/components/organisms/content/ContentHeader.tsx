import { SpeakerWaveIcon, SpeakerXMarkIcon, ArrowLeftIcon, ShareIcon } from "@heroicons/react/16/solid";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Suspense, useEffect, useRef } from "react";
import { useState } from "react";
import { Link } from "react-router";
import YouTube from "react-youtube";
import { MultilineText } from "~/components/atoms/typography";
import { sanitizeClassName } from "~/prophandlers";

type ContentHeaderProps = {
  name: string;
  type: string;
  since: Dayjs;
  until: Dayjs;

  image: string | null;
  videos: {
    title: string;
    youtube: string;
    start: number | null;
  }[] | null;
};

export default function ContentHeader(
  { name, type, since, until, image, videos }: ContentHeaderProps,
) {
  const [currentVideo, setCurrentVideo] = useState(videos?.[0]);
  const videoListRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!currentVideo || !videoListRef.current) {
      return;
    }

    const target = videoListRef.current.children[videos!.findIndex((video) => video.youtube === currentVideo.youtube)] as HTMLElement;
    videoListRef.current.scrollTo({
      left: target.offsetLeft - 40,
      behavior: "smooth",
    });
  }, [currentVideo, videoListRef]);

  const [videoPlaying, setVideoPlaying] = useState(false);
  const selectVideo = (indexDiff: 1 | -1) => {
    if (!videos) {
      return;
    }

    setVideoPlaying(false);
    const newIndex = (videos.findIndex((video) => video.youtube === currentVideo?.youtube) + indexDiff + videos.length) % videos.length;
    setCurrentVideo(videos[newIndex]);
  };

  const [muted, setMuted] = useState(true);
  const playerRef = useRef<any | null>(null);
  const [videoEndTimer, setVideoEndTimer] = useState<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!playerRef?.current) {
      return;
    }

    try {
      if (muted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(30);
      }
    } catch (e) {
      console.error(e);
    }
  }, [muted, playerRef]);

  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setCanShare(navigator.share !== undefined);
  }, []);

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
      <div className="mt-4">
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
    <div>
      <div className="relative w-screen md:w-full -mx-4 md:mx-0 aspect-video group">
        <div className="relative w-full h-full">
          {currentVideo && (
            <Suspense>
              <div className="absolute w-full h-full overflow-hidden md:rounded-xl">
                <YouTube
                  videoId={currentVideo.youtube}
                  className="w-full h-full"
                  iframeClassName="w-full h-full"
                  style={{ transform: 'scale(1.01)' }}
                  opts={{
                    playerVars: {
                      autoplay: 1,
                      mute: 1,
                      controls: 0,
                      rel: 0,
                      start: currentVideo.start ?? 0,
                    }
                  }}
                  // @ts-ignore
                  onReady={(ytEvent) => {
                    playerRef.current = ytEvent.target;
                    setMuted(true);
                  }}
                  // @ts-ignore
                  onPlay={(ytEvent) => {
                    if (videoEndTimer) {
                      clearTimeout(videoEndTimer);
                    }

                    setVideoPlaying(true);
                    setVideoEndTimer(
                      setTimeout(
                        () => { setVideoPlaying(false); },
                        (ytEvent.target.getDuration() - (currentVideo.start ?? 0) - 1.0) * 1000,
                      ),
                    );
                  }}
                  onEnd={() => setVideoPlaying(false)}
                />
              </div>
            </Suspense>
          )}
          <img
            className={`absolute w-full h-full md:rounded-xl ${videoPlaying ? "opacity-0" : "opacity-100"} ease-in duration-500 transition dark:brightness-75 dark:hover:brightness-100`}
            src={image} alt={`${name} 이벤트 이미지`}
          />

          <div className="absolute w-full left-0 top-2 xl:top-4 px-2 xl:px-4 flex items-center gap-2 text-neutral-100">
            <Link to="/futures">
              <div className={`${videoPlaying ? "bg-neutral-900/50 group-hover:bg-neutral-900/80" : "bg-neutral-900/80"} backdrop-blur-sm transition p-2 rounded-full`}>
                <ArrowLeftIcon className="size-4 md:size-5" />
              </div>
            </Link>

            <div className="grow" />
            {canShare && (
              <div
                className={`${videoPlaying ? "bg-neutral-900/50 group-hover:bg-neutral-900/80" : "bg-neutral-900/80"} backdrop-blur-sm transition p-2 rounded-full cursor-pointer`}
                onClick={() => navigator.share({
                  title: name,
                  text: `블루 아카이브의 ${type} "${name.replaceAll("\n", " ")}" 에 대한 정보를 확인해보세요 | 몰루로그`,
                  url: window.location.href,
                })}
              >
                <ShareIcon className="size-4 md:size-5" />
              </div>
            )}
            {videos && videos.length > 0 && (
              <div
                className={`${videoPlaying ? "bg-neutral-900/50 group-hover:bg-neutral-900/80" : "bg-neutral-900/80"} backdrop-blur-sm transition p-2 rounded-full cursor-pointer`}
                onClick={() => setMuted((prev) => !prev)}
              >
                {muted ? <SpeakerXMarkIcon className="size-4 md:size-5" /> : <SpeakerWaveIcon className="size-4 md:size-5" />}
              </div>
            )}
          </div>
        </div>
        <div className={sanitizeClassName(`
          absolute bottom-0 w-full px-4 md:px-6 py-4 text-white bg-linear-to-t from-neutral-900/75 from-75% md:rounded-b-xl
          ${videoPlaying ? "opacity-75" : ""} group-hover:opacity-100 transition-opacity
        `)}>
          <p className="text-sm md:text-base text-neutral-300">{type}</p>
          <MultilineText className="text-lg md:text-2xl font-bold" texts={name.split("\n")} />
          <div className="flex items-end">
            <p className="grow text-sm md:text-base">
              {dayjs(since).format("YYYY-MM-DD")} ~ {dayjs(until).format("YYYY-MM-DD")}
            </p>
            <span className="py-1 px-4 bg-neutral-900 text-xs md:text-sm rounded-full">{dDayText}</span>
          </div>
        </div>
      </div>

      {videos && videos.length > 0 && (
        <div className="w-full my-2 relative">
          <div className="w-full px-10 flex flex-nowrap overflow-x-scroll no-scrollbar" ref={videoListRef}>
            {videos.map((video) => (
              <span
                key={video.youtube}
                className={sanitizeClassName(`
                  -mx-1 px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition text-sm cursor-pointer shrink-0
                  ${currentVideo?.youtube === video.youtube ? "bg-neutral-100 dark:bg-neutral-700 font-bold" : ""}
              `)}
                onClick={() => setCurrentVideo(video)}
              >
                {video.title}
              </span>
            ))}
          </div>
          <div className="h-full w-8 absolute left-0 top-0 flex items-center justify-center bg-white dark:bg-neutral-800">
            <ChevronDoubleLeftIcon
              className="p-1 size-6 hover:bg-black hover:text-white rounded-full transition cursor-pointer" strokeWidth={2}
              onClick={() => selectVideo(-1)}
            />
          </div>
          <div className="h-full w-8 absolute right-0 top-0 flex items-center justify-center bg-white dark:bg-neutral-800">
            <ChevronDoubleRightIcon
              className="p-1 size-6 hover:bg-black hover:text-white rounded-full transition cursor-pointer" strokeWidth={2}
              onClick={() => selectVideo(1)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
