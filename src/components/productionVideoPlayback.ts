type PlaybackOptions = {
  source: string;
  onFallbackChange: (visible: boolean) => void;
};

const playbackOwners = new WeakMap<HTMLVideoElement, object>();

/** Own media side effects separately from rendering so native controls keep working. */
export function attachProductionVideo(video: HTMLVideoElement, { source, onFallbackChange }: PlaybackOptions) {
  const owner = {};
  playbackOwners.set(video, owner);
  const doc = video.ownerDocument;
  const win = doc.defaultView!;
  const motion = win.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motion.matches;
  let loaded = false;
  let visible = false;
  let userPaused = false;
  let blocked = false;
  let finished = false;
  let disposed = false;
  let ignoredPauses = 0;
  let request = 0;
  let pending = false;
  let lastPlayWasManual = false;
  let geometryFrame = 0;

  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = false;

  const publish = () => {
    if (!disposed) onFallbackChange(video.paused && (reduced || blocked || userPaused || finished));
  };
  const pauseForEnvironment = () => {
    request += 1;
    pending = false;
    video.autoplay = false;
    if (!video.paused) {
      ignoredPauses += 1;
      video.pause();
    }
    publish();
  };
  const load = () => {
    if (loaded) return;
    loaded = true;
    video.preload = 'metadata';
    video.src = source;
    video.load();
  };
  const play = (manual: boolean) => {
    if (disposed || doc.hidden) return;
    if (manual) {
      userPaused = false;
      blocked = false;
      finished = false;
      // An explicit click may precede IntersectionObserver's first notification.
      visible = true;
    }
    load();
    if (!visible || (!manual && (reduced || userPaused || blocked || finished)) || pending) return;
    const currentRequest = ++request;
    pending = true;
    lastPlayWasManual = manual;
    let promise: Promise<void> | undefined;
    try { promise = video.play(); } catch {
      pending = false;
      blocked = true;
      video.autoplay = false;
      publish();
      return;
    }
    Promise.resolve(promise).then(() => {
      if (disposed) {
        // A StrictMode remount may already have attached a new owner to this node.
        if (!playbackOwners.has(video)) video.pause();
        return;
      }
      if (currentRequest !== request) {
        if ((!visible || doc.hidden || (reduced && !lastPlayWasManual)) && !pending) pauseForEnvironment();
        return;
      }
      pending = false;
      if (!visible || doc.hidden || (!manual && reduced)) pauseForEnvironment();
      publish();
    }).catch(() => {
      if (disposed || currentRequest !== request) return;
      pending = false;
      blocked = true;
      video.autoplay = false;
      publish();
    });
  };
  const sync = () => {
    if (disposed) return;
    video.autoplay = loaded && visible && !doc.hidden && !reduced && !userPaused && !blocked && !finished;
    if (!visible || doc.hidden) pauseForEnvironment();
    else if (video.autoplay && video.paused && !pending) play(false);
    publish();
  };
  const onPlay = () => {
    if (!visible || doc.hidden) { pauseForEnvironment(); return; }
    // Native play is also a valid explicit retry, including reduced-motion mode.
    if (!pending) lastPlayWasManual = true;
    userPaused = false;
    blocked = false;
    finished = false;
    publish();
  };
  const onPause = () => {
    if (ignoredPauses > 0) { ignoredPauses -= 1; return; }
    if (!video.paused) return; // Ignore a queued pause event after a newer play.
    if (!video.ended && visible && !doc.hidden) {
      userPaused = true;
      request += 1;
      pending = false;
      video.autoplay = false;
    }
    publish();
  };
  const onEnded = () => {
    finished = true;
    video.autoplay = false;
    publish();
  };
  const onMotionChange = () => {
    reduced = motion.matches;
    if (reduced) {
      lastPlayWasManual = false;
      pauseForEnvironment();
    }
    else sync();
    publish();
  };
  const onVisibility = () => sync();
  const setVisible = (value: boolean) => {
    visible = value;
    if (visible) load();
    sync();
  };
  let nearObserver: IntersectionObserver | undefined;
  let viewObserver: IntersectionObserver | undefined;
  const checkGeometry = () => {
    geometryFrame = 0;
    const rect = video.getBoundingClientRect();
    const viewportHeight = win.innerHeight;
    const horizontallyVisible = rect.right > 0 && rect.left < win.innerWidth;
    if (horizontallyVisible && rect.bottom > -300 && rect.top < viewportHeight + 300) load();
    setVisible(horizontallyVisible && rect.bottom > 0 && rect.top < viewportHeight && rect.height > 0);
  };
  const scheduleGeometry = () => {
    if (!geometryFrame) geometryFrame = win.requestAnimationFrame(checkGeometry);
  };

  video.addEventListener('play', onPlay);
  video.addEventListener('pause', onPause);
  video.addEventListener('ended', onEnded);
  doc.addEventListener('visibilitychange', onVisibility);
  if (motion.addEventListener) motion.addEventListener('change', onMotionChange);
  else motion.addListener(onMotionChange);

  if (typeof win.IntersectionObserver === 'function') {
    nearObserver = new win.IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        load();
        sync();
        nearObserver?.disconnect();
      }
    }, { rootMargin: '300px 0px', threshold: 0 });
    viewObserver = new win.IntersectionObserver(entries => {
      const entry = entries[0];
      setVisible(entry.isIntersecting && entry.intersectionRatio >= .1);
    }, { threshold: [0, .1] });
    nearObserver.observe(video);
    viewObserver.observe(video);
  } else {
    checkGeometry();
    win.addEventListener('scroll', scheduleGeometry, { passive: true });
    win.addEventListener('resize', scheduleGeometry);
  }
  publish();

  return {
    playManually: () => play(true),
    destroy() {
      disposed = true;
      pauseForEnvironment();
      if (playbackOwners.get(video) === owner) playbackOwners.delete(video);
      nearObserver?.disconnect();
      viewObserver?.disconnect();
      win.cancelAnimationFrame(geometryFrame);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      doc.removeEventListener('visibilitychange', onVisibility);
      if (motion.removeEventListener) motion.removeEventListener('change', onMotionChange);
      else motion.removeListener(onMotionChange);
      win.removeEventListener('scroll', scheduleGeometry);
      win.removeEventListener('resize', scheduleGeometry);
    },
  };
}
