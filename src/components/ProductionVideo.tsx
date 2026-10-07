import { useEffect, useRef, useState } from 'react';
import { attachProductionVideo } from './productionVideoPlayback';

const SOURCE = '/assets/video/hero-web.mp4';

type ProductionVideoProps = {
  source?: string;
  poster?: string;
  id?: string;
  width?: number;
  height?: number;
  label?: string;
  describedBy?: string;
  className?: string;
};

export function ProductionVideo({
  source = SOURCE,
  poster = '/assets/video/hero-web-poster.jpg',
  id = 'hero-production-video',
  width = 1280,
  height = 804,
  label = 'Demo de PlayWorship con biblioteca, mezclador y Pads, sin audio',
  describedBy = 'hero-demo-caption',
  className = 'hero-demo-video',
}: ProductionVideoProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<ReturnType<typeof attachProductionVideo>>();
  const [fallback, setFallback] = useState({ source, visible: false });
  const showFallback = fallback.source === source && fallback.visible;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setFallback({ source, visible: false });
    const playback = attachProductionVideo(video, {
      source,
      onFallbackChange: visible => setFallback({ source, visible }),
    });
    playbackRef.current = playback;
    return () => {
      playback.destroy();
      playbackRef.current = undefined;
    };
  }, [source]);

  return <>
    <video
      key={source}
      ref={videoRef}
      id={id}
      className={className}
      width={width}
      height={height}
      controls
      muted
      playsInline
      preload="none"
      poster={poster}
      aria-label={label}
      aria-describedby={describedBy || undefined}
    >
      Tu navegador no puede reproducir este video. <a href={source}>Abrir el video de PlayWorship</a>.
    </video>
    {showFallback && <button
      type="button"
      className="hero-video-play btn-secondary"
      aria-controls={id}
      onClick={() => {
        playbackRef.current?.playManually();
        videoRef.current?.focus();
      }}
    >Reproducir demo</button>}
  </>;
}
