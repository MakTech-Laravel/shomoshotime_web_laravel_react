import { useEffect, useRef, useState } from "react";

export type AudioPlayerTrack = {
  src: string;
  title: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  displayDuration?: string; // shown in playlist before file loads (e.g. "58:03")
};

type AudioPlayerProps = {
  tracks: AudioPlayerTrack[];
  className?: string;
};

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) {
    return (
      <svg className="size-4.75 lg:size-5.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      </svg>
    );
  }
  if (volume < 0.5) {
    return (
      <svg className="size-4.75 lg:size-5.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
      </svg>
    );
  }
  return (
    <svg className="size-4.75 lg:size-5.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

export function AudioPlayer({ tracks, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showPlaylist, setShowPlaylist] = useState(true);

  const currentTrack = tracks[activeIndex] ?? tracks[0];
  const isMulti = tracks.length > 1;

  // Reset playback when active track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [activeIndex]);

  // Load duration for current track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function sync() {
      if (audio && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    }

    audio.addEventListener("loadedmetadata", sync);
    audio.addEventListener("durationchange", sync);
    if (audio.readyState >= 1) sync();
    else audio.load();

    return () => {
      audio.removeEventListener("loadedmetadata", sync);
      audio.removeEventListener("durationchange", sync);
    };
  }, [currentTrack.src]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }

  function selectTrack(index: number) {
    setActiveIndex(index);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  // Auto advance to next track when current ends
  function handleEnded() {
    if (activeIndex < tracks.length - 1) {
      setActiveIndex((i) => i + 1);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={className}>
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="metadata"
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onEnded={handleEnded}
      />

      <div className="overflow-hidden rounded-sm border border-[#c8c8c8] bg-white">

        {/* ── Main player row ── */}
        <div className="flex flex-col md:flex-row md:items-stretch">

          {/* Album art + play (side-by-side on mobile) */}
          <div className="flex items-center gap-4 bg-[#d0e6f2] p-4 md:shrink-0 md:gap-0 md:p-0">
            <div className="flex w-20 shrink-0 items-center justify-center sm:w-24 md:w-36 md:p-5 lg:w-52 lg:p-7">
              <img
                src={currentTrack.albumArt ?? "/images/logo.png"}
                alt={currentTrack.artist ?? "Album art"}
                className="h-auto w-full select-none object-contain"
                draggable={false}
              />
            </div>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex size-14 shrink-0 items-center justify-center rounded-full border border-black transition-colors hover:bg-black/5 md:hidden"
            >
              {isPlaying ? (
                <svg className="size-5" viewBox="0 0 24 24" fill="black" aria-hidden>
                  <rect x="5" y="4" width="4" height="16" />
                  <rect x="15" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="size-5" viewBox="0 0 24 24" fill="black" aria-hidden>
                  <polygon points="8,3 22,12 8,21" />
                </svg>
              )}
            </button>
          </div>

          {/* Play / Pause button (desktop) */}
          <div className="hidden shrink-0 items-center px-7 md:flex lg:px-10">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex size-15.5 items-center justify-center rounded-full border border-black transition-colors hover:bg-black/5 lg:size-20"
            >
              {isPlaying ? (
                <svg className="size-5.5 lg:size-7" viewBox="0 0 24 24" fill="black" aria-hidden>
                  <rect x="5" y="4" width="4" height="16" />
                  <rect x="15" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="size-5.5 lg:size-7" viewBox="0 0 24 24" fill="black" aria-hidden>
                  <polygon points="8,3 22,12 8,21" />
                </svg>
              )}
            </button>
          </div>

          {/* Track info + controls */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 px-4 py-5 sm:px-6 md:gap-4.5 md:px-0 md:py-6 md:pr-8 lg:gap-6 lg:py-8 lg:pr-12">

            {/* Track info */}
            <div className="min-w-0">
              {currentTrack.artist && (
                <p className="text-[13px] font-normal leading-none text-[#b8860b] lg:text-[15px]">{currentTrack.artist}</p>
              )}
              <p className="mt-1.25 line-clamp-2 text-base font-bold leading-snug text-black sm:line-clamp-1 sm:truncate lg:mt-1.5 lg:text-xl">{currentTrack.title}</p>
              {currentTrack.album && (
                <p className="mt-0.75 text-[13px] leading-tight text-gray-500 lg:mt-1 lg:text-[15px]">{currentTrack.album}</p>
              )}
            </div>

            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 lg:gap-4">

              {/* Skip to start */}
              <button
                type="button"
                aria-label="Skip to start"
                onClick={() => { if (audioRef.current) { audioRef.current.currentTime = 0; setCurrentTime(0); } }}
                className="shrink-0 text-black hover:opacity-70"
              >
                <svg className="size-4.25 lg:size-5.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                </svg>
              </button>

              {/* Skip to end */}
              <button
                type="button"
                aria-label="Skip to end"
                onClick={() => { if (audioRef.current) { audioRef.current.currentTime = duration; setCurrentTime(duration); setIsPlaying(false); } }}
                className="shrink-0 text-black hover:opacity-70"
              >
                <svg className="size-4.25 lg:size-5.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>

              {/* Progress bar */}
              <div className="relative flex flex-1 items-center" style={{ height: 24 }}>
                <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#d0d0d0] lg:h-2" />
                <div
                  className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#b8a030] lg:h-2"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 size-3.25 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2e2200] lg:size-4"
                  style={{ left: `${progress}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.05}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Seek"
                />
              </div>

              {/* Time display */}
              <span className="shrink-0 whitespace-nowrap tabular-nums text-[12px] text-[#555] lg:text-[14px]">
                {formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}
              </span>

              {/* Volume — horizontal slider on touch/mobile, hover popup on desktop */}
              <div className="flex min-w-[4.5rem] flex-1 items-center gap-2 sm:min-w-0 sm:flex-initial md:hidden">
                <VolumeIcon volume={volume} />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume level"
                  className="h-1.5 w-full min-w-12 flex-1 cursor-pointer accent-[#b8a030]"
                />
              </div>
              <div className="group relative hidden shrink-0 md:block">
                <button type="button" aria-label="Volume" className="flex items-center text-[#444] hover:text-black">
                  <VolumeIcon volume={volume} />
                </button>
                <div
                  className="pointer-events-none absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 flex-col items-center rounded border border-[#ddd] bg-white px-2 py-3 opacity-0 shadow-md transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
                  style={{ width: 30, height: 90 }}
                >
                  <div className="relative flex h-full w-full items-center justify-center">
                    <div className="absolute bottom-0 left-1/2 h-full w-1 -translate-x-1/2 rounded-full bg-[#d0d0d0]" />
                    <div className="absolute bottom-0 left-1/2 w-1 -translate-x-1/2 rounded-full bg-[#b8a030]" style={{ height: `${volume * 100}%` }} />
                    <div className="absolute left-1/2 size-3 -translate-x-1/2 rounded-full bg-[#2e2200] shadow-sm" style={{ bottom: `calc(${volume * 100}% - 6px)` }} />
                    <input
                      type="range" min={0} max={1} step={0.01} value={volume}
                      onChange={handleVolumeChange} aria-label="Volume level"
                      className="absolute cursor-pointer opacity-0"
                      style={{ width: 74, height: 16, transform: "rotate(-90deg)", transformOrigin: "center" }}
                    />
                  </div>
                  <div className="absolute top-full h-2 w-full" />
                </div>
              </div>

              {/* Queue / playlist toggle */}
              <button
                type="button"
                aria-label="Toggle playlist"
                onClick={() => setShowPlaylist((v) => !v)}
                className="shrink-0 text-[#444] hover:text-black"
              >
                <svg className="size-4.75 lg:size-5.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Playlist ── */}
        {showPlaylist && (
          isMulti ? (
            /* Numbered multi-track list */
            <div className="border-t border-[#e2e2e2]">
              {tracks.map((t, i) => {
                const active = i === activeIndex;
                const dispDuration = active && duration > 0
                  ? formatTime(duration)
                  : (t.displayDuration ?? "--:--");
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectTrack(i)}
                    className={`flex w-full items-center gap-3 border-b border-[#ebebeb] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#faf8f4] sm:gap-4 sm:px-6 lg:gap-5 lg:px-8 lg:py-3.5 ${active ? "bg-[#fdfaf5]" : ""}`}
                  >
                    {/* Track number */}
                    <span className={`w-5 shrink-0 text-center text-[13px] tabular-nums lg:text-[14px] ${active ? "font-semibold text-[#b8860b]" : "text-[#999]"}`}>
                      {i + 1}
                    </span>
                    {/* Track title */}
                    <span className={`flex-1 truncate text-[13px] leading-snug lg:text-[14px] ${active ? "font-semibold text-[#b8860b]" : "font-normal text-[#222]"}`}>
                      {t.title}
                    </span>
                    {/* Duration */}
                    <span className="shrink-0 tabular-nums text-[12px] text-[#888] lg:text-[13px]">{dispDuration}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Single-track playlist row */
            <div className="border-t border-[#e2e2e2] px-4 py-3.5 sm:px-6 lg:px-8 lg:py-4.5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2.5 lg:gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label="Play track"
                    className="flex size-5 shrink-0 items-center justify-center rounded-full border border-[#b8860b] lg:size-6"
                  >
                    <svg className="size-2 lg:size-2.5" viewBox="0 0 24 24" fill="#b8860b" aria-hidden>
                      <polygon points="7,3 22,12 7,21" />
                    </svg>
                  </button>
                  <span className="truncate text-[13px] text-[#b8860b] lg:text-[15px]">{currentTrack.title}</span>
                </div>
                <span className="shrink-0 tabular-nums text-[13px] text-[#666] lg:text-[15px]">{formatTime(duration)}</span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
