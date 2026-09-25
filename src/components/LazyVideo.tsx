import { useEffect, useRef, useState, type ReactNode, type VideoHTMLAttributes } from 'react';

type LazyVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src' | 'children'> & {
  src: string;
  fallback?: ReactNode;
};

export function LazyVideo({ src, fallback, ...props }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inViewRef = useRef(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!('IntersectionObserver' in window)) {
      inViewRef.current = true;
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          setShouldLoad(true);
          if (video.src) void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: '300px 0px', threshold: 0.01 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldLoad && inViewRef.current) {
      void videoRef.current?.play().catch(() => {});
    }
  }, [shouldLoad]);

  return (
    <video
      {...props}
      ref={videoRef}
      src={shouldLoad ? src : undefined}
      autoPlay
      muted
      loop
      playsInline
      preload={shouldLoad ? 'metadata' : 'none'}
    >
      {fallback}
    </video>
  );
}
