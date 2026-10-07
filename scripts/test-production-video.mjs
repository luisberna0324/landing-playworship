import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const compile = file => ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const playbackCode = compile('../src/components/productionVideoPlayback.ts');

class Events {
  listeners = new Map();
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  emit(type) { for (const listener of this.listeners.get(type) || []) listener({ type }); }
  count() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0); }
}

function fixture({ reduced = false, hidden = false, noObserver = false, top = 1500, playResponses = [], source = '/assets/video/hero-web.mp4' } = {}) {
  const doc = Object.assign(new Events(), { hidden });
  const media = Object.assign(new Events(), { matches: reduced });
  const observers = [];
  const frames = new Map();
  let nextFrame = 0;
  const win = Object.assign(new Events(), {
    innerWidth: 1000, innerHeight: 800,
    matchMedia: () => media,
    requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: id => frames.delete(id),
  });
  if (!noObserver) win.IntersectionObserver = class {
    constructor(callback, options) { this.callback = callback; this.options = options; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
    update(inView) { this.callback([{ isIntersecting: inView, intersectionRatio: inView ? 1 : 0 }]); }
  };
  doc.defaultView = win;
  let videoTop = top;
  let playCalls = 0;
  let loadCalls = 0;
  const deferred = [];
  const playTimes = [];
  const seeks = [];
  let currentTime = 0;
  const video = Object.assign(new Events(), {
    ownerDocument: doc, paused: true, ended: false, muted: false, defaultMuted: false,
    autoplay: false, preload: 'none', src: '',
    readyState: 0, duration: NaN,
    getBoundingClientRect: () => ({ top: videoTop, bottom: videoTop + 500, height: 500, left: 20, right: 980 }),
    load() { loadCalls++; },
    play() {
      playCalls++;
      playTimes.push(this.currentTime);
      const response = playResponses.shift();
      if (response === 'throw') throw new Error('Not allowed');
      if (response === 'reject') return Promise.reject(new Error('Not allowed'));
      this.paused = false;
      this.ended = false;
      this.emit('play');
      if (response === 'defer') return new Promise((resolve, reject) => deferred.push({ resolve, reject }));
      return Promise.resolve();
    },
    pause() {
      if (this.paused) return;
      this.paused = true;
      this.emit('pause');
    },
  });
  Object.defineProperty(video, 'currentTime', {
    get: () => currentTime,
    set(value) { currentTime = value; seeks.push(value); },
  });
  const context = vm.createContext({ exports: {} });
  vm.runInContext(playbackCode, context);
  const fallbacks = [];
  const control = context.exports.attachProductionVideo(video, {
    source, onFallbackChange: value => fallbacks.push(value),
  });
  return {
    doc, win, video, media, observers, control, deferred, fallbacks, frames, playTimes, seeks,
    near: value => observers.find(observer => observer.options.rootMargin)?.update(value),
    visible: value => observers.find(observer => !observer.options.rootMargin)?.update(value),
    hidden(value) { doc.hidden = value; doc.emit('visibilitychange'); },
    reduced(value) { media.matches = value; media.emit('change'); },
    metadata(duration = 108.83) { video.duration = duration; video.readyState = 1; video.emit('loadedmetadata'); },
    scroll(top) { videoTop = top; win.emit('scroll'); for (const [id, callback] of frames) { frames.delete(id); callback(); } },
    playCalls: () => playCalls, loadCalls: () => loadCalls,
    fallback: () => fallbacks.at(-1),
    reattach: () => context.exports.attachProductionVideo(video, {
      source, onFallbackChange: value => fallbacks.push(value),
    }),
  };
}

const settle = async () => { for (let n = 0; n < 6; n++) await Promise.resolve(); };

test('validated #t=49 seeks after metadata and before the first autoplay, exactly once', async () => {
  const page = fixture({ source: '/assets/video/mobileNativo-web.mp4#t=49' });
  page.visible(true);
  assert.equal(page.playCalls(), 0);
  assert.equal(page.video.autoplay, false);
  assert.equal(page.seeks.length, 0);
  page.metadata(125);
  await settle();
  assert.equal(page.video.currentTime, 49);
  assert.deepEqual(page.playTimes, [49]);
  assert.deepEqual(page.seeks, [49]);
  page.metadata(125);
  page.visible(true);
  assert.deepEqual(page.seeks, [49], 'Repeated metadata/visibility events must not seek again');
  page.control.destroy();
});

test('plain sources start at zero without an unnecessary seek', async () => {
  const page = fixture();
  page.visible(true);
  page.metadata();
  await settle();
  assert.deepEqual(page.playTimes, [0]);
  assert.deepEqual(page.seeks, []);
  page.control.destroy();
});

test('fragment playback keeps mid-clip position on resume and restores the start on explicit replay', async () => {
  const page = fixture({ source: '/assets/video/mobileNativo-web.mp4#t=49' });
  page.visible(true);
  page.metadata(125);
  await settle();
  page.video.currentTime = 64;
  page.video.pause();
  page.control.playManually();
  await settle();
  assert.equal(page.playTimes.at(-1), 64);
  page.video.currentTime = 125;
  page.video.ended = true;
  page.video.paused = true;
  page.video.emit('ended');
  page.control.playManually();
  await settle();
  assert.equal(page.playTimes.at(-1), 49);
  page.control.destroy();
});

test('native replay restores the fragment after native controls reset to zero', async () => {
  const page = fixture({ source: '/assets/video/mobileNativo-web.mp4#t=49' });
  page.visible(true);
  page.metadata(125);
  await settle();
  page.video.ended = true;
  page.video.paused = true;
  page.video.emit('ended');
  page.video.currentTime = 0;
  await page.video.play();
  assert.equal(page.video.currentTime, 49);
  page.control.destroy();
});

test('manual reduced-motion playback waits for metadata, then starts at the fragment', async () => {
  const page = fixture({ source: '/assets/video/mobileNativo-web.mp4#t=49', reduced: true });
  page.visible(true);
  page.control.playManually();
  assert.equal(page.playCalls(), 0);
  page.metadata(125);
  await settle();
  assert.deepEqual(page.playTimes, [49]);
  page.control.destroy();
});

test('hidden fragment playback seeks after metadata but waits to autoplay until visible', async () => {
  const page = fixture({ source: '/assets/video/mobileNativo-web.mp4#t=49' });
  page.visible(true);
  page.hidden(true);
  page.metadata(125);
  assert.equal(page.playCalls(), 0);
  page.hidden(false);
  await settle();
  assert.deepEqual(page.playTimes, [49]);
  page.control.destroy();
});

test('invalid or out-of-range fragments safely fall back to the beginning', async () => {
  for (const fragment of ['#t=-1', '#t=Infinity', '#t=49oops', '#t=999']) {
    const page = fixture({ source: `/assets/video/mobileNativo-web.mp4${fragment}` });
    page.visible(true);
    page.metadata(125);
    await settle();
    assert.equal(page.video.currentTime, 0, fragment);
    assert.deepEqual(page.playTimes, [0]);
    page.control.destroy();
  }
});

test('render preserves exact poster, native controls, inline playback, and deferred source loading', () => {
  const context = vm.createContext({ exports: {}, require: name => name === './productionVideoPlayback' ? {} : require(name) });
  vm.runInContext(compile('../src/components/ProductionVideo.tsx'), context);
  const React = require('react');
  const html = require('react-dom/server').renderToStaticMarkup(React.createElement(context.exports.ProductionVideo));
  assert.match(html, /controls=""/);
  assert.match(html, /muted=""/);
  assert.match(html, /playsinline=""/);
  assert.match(html, /preload="none"/);
  assert.match(html, /poster="\/assets\/video\/hero-web-poster.jpg"/);
  assert.match(html, /aria-describedby="hero-demo-caption"/);
  assert.doesNotMatch(html, /<video[^>]*\ssrc=/);
  assert.doesNotMatch(html, /\sloop=/);
});

test('reusable video props render independent clip identity, dimensions, and accessible description', () => {
  const context = vm.createContext({ exports: {}, require: name => name === './productionVideoPlayback' ? {} : require(name) });
  vm.runInContext(compile('../src/components/ProductionVideo.tsx'), context);
  const React = require('react');
  const html = require('react-dom/server').renderToStaticMarkup(React.createElement(context.exports.ProductionVideo, {
    source: '/assets/video/mobileNativo-web.mp4',
    poster: '/assets/video/mobileNativo-web-poster.jpg',
    id: 'mobile-production-video',
    width: 540,
    height: 960,
    label: 'Demo móvil de PlayWorship, sin audio',
    describedBy: 'mobile-demo-caption',
    className: 'mobile-demo-video',
  }));
  assert.match(html, /id="mobile-production-video"/);
  assert.match(html, /class="mobile-demo-video"/);
  assert.match(html, /width="540" height="960"/);
  assert.match(html, /poster="\/assets\/video\/mobileNativo-web-poster.jpg"/);
  assert.match(html, /aria-label="Demo móvil de PlayWorship, sin audio"/);
  assert.match(html, /aria-describedby="mobile-demo-caption"/);
  assert.match(html, /href="\/assets\/video\/mobileNativo-web.mp4"/);
  assert.doesNotMatch(html, /<video[^>]*\ssrc=/);
  assert.doesNotMatch(html, /hero-/);
});

test('source waits until near view; autoplay starts only when actually visible', async () => {
  const page = fixture();
  assert.equal(page.video.src, '');
  assert.equal(page.video.muted, true);
  assert.equal(page.video.defaultMuted, true);
  page.near(true);
  assert.equal(page.video.src, '/assets/video/hero-web.mp4');
  assert.equal(page.video.preload, 'metadata');
  assert.equal(page.playCalls(), 0);
  page.visible(true);
  await settle();
  assert.equal(page.playCalls(), 1);
  assert.equal(page.video.autoplay, true);
  assert.equal(page.video.paused, false);
  assert.equal(page.loadCalls(), 1);
  page.control.destroy();
});

test('offscreen and hidden playback pauses, then resumes without duplicate loads', async () => {
  const page = fixture();
  page.visible(true);
  await settle();
  page.visible(false);
  assert.equal(page.video.paused, true);
  page.visible(true);
  await settle();
  assert.equal(page.playCalls(), 2);
  page.hidden(true);
  assert.equal(page.video.paused, true);
  page.hidden(false);
  await settle();
  assert.equal(page.playCalls(), 3);
  assert.equal(page.loadCalls(), 1);
  page.control.destroy();
});

test('native manual pause survives visibility updates until explicit playback', async () => {
  const page = fixture();
  page.visible(true);
  await settle();
  page.video.pause();
  page.visible(true);
  page.hidden(true);
  page.hidden(false);
  page.visible(false);
  page.visible(true);
  await settle();
  assert.equal(page.playCalls(), 1);
  assert.equal(page.video.paused, true);
  assert.equal(page.fallback(), true);
  page.control.playManually();
  await settle();
  assert.equal(page.playCalls(), 2);
  assert.equal(page.fallback(), false);
  page.control.destroy();
});

for (const rejection of ['reject', 'throw']) {
  test(`autoplay ${rejection} exposes fallback; explicit retry recovers`, async () => {
    const page = fixture({ playResponses: [rejection] });
    page.visible(true);
    await settle();
    assert.equal(page.fallback(), true);
    assert.equal(page.video.autoplay, false);
    page.visible(false);
    page.visible(true);
    assert.equal(page.playCalls(), 1, 'Do not repeatedly retry a denied autoplay');
    page.control.playManually();
    await settle();
    assert.equal(page.video.paused, false);
    assert.equal(page.fallback(), false);
    page.control.destroy();
  });
}

test('reduced motion starts with manual fallback and never automatically resumes manual playback', async () => {
  const page = fixture({ reduced: true });
  page.visible(true);
  assert.equal(page.playCalls(), 0);
  assert.equal(page.video.autoplay, false);
  assert.equal(page.fallback(), true);
  page.control.playManually();
  await settle();
  assert.equal(page.video.paused, false);
  assert.equal(page.fallback(), false);
  page.hidden(true);
  page.hidden(false);
  assert.equal(page.video.paused, true);
  assert.equal(page.playCalls(), 1);
  assert.equal(page.fallback(), true);
  page.control.destroy();
});

test('live reduced-motion change pauses playback; disabling it allows autoplay', async () => {
  const page = fixture();
  page.visible(true);
  await settle();
  page.reduced(true);
  assert.equal(page.video.paused, true);
  assert.equal(page.fallback(), true);
  page.reduced(false);
  await settle();
  assert.equal(page.video.paused, false);
  page.control.destroy();
});

test('late autoplay resolution after scrolling away cannot restart hidden playback', async () => {
  const page = fixture({ playResponses: ['defer'] });
  page.visible(true);
  page.visible(false);
  page.video.paused = false;
  page.deferred[0].resolve();
  await settle();
  assert.equal(page.video.paused, true);
  assert.equal(page.fallback(), false);
  page.control.destroy();
});

test('a stale autoplay promise cannot cancel newer explicit playback in reduced-motion mode', async () => {
  const page = fixture({ playResponses: ['defer'] });
  page.visible(true);
  page.reduced(true);
  page.control.playManually();
  await settle();
  assert.equal(page.video.paused, false);
  page.deferred[0].resolve();
  await settle();
  assert.equal(page.video.paused, false);
  page.control.destroy();
});

test('a disposed controller cannot pause playback after a new effect owns the same video', async () => {
  const page = fixture({ playResponses: ['defer'] });
  page.visible(true);
  page.control.destroy();
  const replacement = page.reattach();
  page.observers.at(-1).update(true);
  await settle();
  assert.equal(page.video.paused, false);
  page.deferred[0].resolve();
  await settle();
  assert.equal(page.video.paused, false);
  replacement.destroy();
});

test('ended demo stays ended on visibility changes and can be explicitly replayed', async () => {
  const page = fixture();
  page.visible(true);
  await settle();
  page.video.ended = true;
  page.video.paused = true;
  page.video.emit('pause');
  page.video.emit('ended');
  page.visible(false);
  page.visible(true);
  assert.equal(page.playCalls(), 1);
  assert.equal(page.fallback(), true);
  page.control.playManually();
  await settle();
  assert.equal(page.playCalls(), 2);
  assert.equal(page.fallback(), false);
  page.control.destroy();
});

test('without IntersectionObserver geometry still defers load and pauses offscreen', async () => {
  const page = fixture({ noObserver: true });
  assert.equal(page.video.src, '');
  page.scroll(950);
  assert.equal(page.loadCalls(), 1);
  assert.equal(page.playCalls(), 0);
  page.scroll(500);
  await settle();
  assert.equal(page.video.paused, false);
  page.scroll(-550);
  assert.equal(page.video.paused, true);
  page.control.destroy();
  assert.equal(page.win.count(), 0);
});

test('cleanup removes observers/listeners, pauses playback, and ignores a late promise', async () => {
  const page = fixture({ playResponses: ['defer'] });
  page.visible(true);
  page.control.destroy();
  const notifications = page.fallbacks.length;
  page.video.paused = false;
  page.deferred[0].resolve();
  await settle();
  assert.equal(page.video.paused, true);
  assert.equal(page.video.count(), 0);
  assert.equal(page.doc.count(), 0);
  assert.equal(page.media.count(), 0);
  assert.equal(page.win.count(), 0);
  assert.equal(page.fallbacks.length, notifications);
  assert.ok(page.observers.every(observer => observer.disconnected));
});
