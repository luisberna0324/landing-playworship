import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseReleaseSummary, helpReleaseURL, newerOrEqual, fetchReleaseSummary, RELEASE_SUMMARY_URL} from '../.test-build/releases/releaseSummary.mjs';
import {ReleaseNotesLink} from '../.test-build/components/ReleaseNotesLink.mjs';
import {Downloads} from '../.test-build/components/Downloads.mjs';
import {MICROSOFT_STORE_ID, MICROSOFT_STORE_URL, MICROSOFT_STORE_DEEP_LINK} from '../.test-build/appLinks.mjs';
const snapshot = JSON.parse(await readFile('src/generated/release-summary.json', 'utf8'));

test('release-notes link points to the full help history without duplicating its content', () => {
  const value = parseReleaseSummary(snapshot);
  assert.equal(value.version, '2.4.0'); assert.equal(value.highlights.length, 3);
  assert.ok(!('changes' in value) && !('distribution' in value));
  const html = renderToStaticMarkup(React.createElement(ReleaseNotesLink, {platform: 'Windows'}));
  assert.match(html, /Notas de versión/);
  assert.match(html, /href="https:\/\/help\.playworship\.app\/#novedades"/);
  assert.equal((html.match(/<a /g) || []).length, 1);
  for (const item of value.highlights) assert.ok(!html.includes(item));
  assert.ok(!html.includes(value.title) && !html.includes(value.summary));
  assert.doesNotMatch(html, /<h2|<ul|<time|release-highlights-version|v2\.4\.0|Resumen incluido/);
  assert.doesNotMatch(html, /Continuar con Apple|Build 134|checkout|paddle|\.exe|\.pkg|\.apk/i);
  assert.match(html, /para Windows/);
});

test('all four platform cards include notes directly after their primary download action', async () => {
  const html = renderToStaticMarkup(React.createElement(Downloads));
  const cards = html.match(/<article class="download-card[^>]*>[\s\S]*?<\/article>/g);
  assert.equal(cards.length, 4);
  for (const [index, card] of cards.entries()) {
    const platform = ['Windows', 'macOS', 'Android', 'iPhone y iPad'][index];
    assert.equal((card.match(/class="platform-release-notes"/g) || []).length, 1);
    assert.match(card, /class="platform-download"[\s\S]*?<\/a><a class="platform-release-notes"/);
    assert.ok(card.includes('para ' + platform));
    assert.match(card, /href="https:\/\/help\.playworship\.app\/#novedades"/);
  }
  assert.ok(cards[0].includes(`class="platform-download" href="${MICROSOFT_STORE_URL}"`));
  assert.match(cards[0], /Descargar en Microsoft Store/);
  assert.match(cards[0], /class="platform-beta" href="[^"]+\.exe"/);
  assert.match(cards[0], /direct-download-version">Enlace alternativo · v2\.0\.2/);
  assert.match(cards[1], /class="platform-download" href="https:\/\/apps\.apple\.com\/us\/app\/playworship\/id6819361132"/);
  assert.match(cards[1], /class="platform-beta" href="[^"]+\.pkg"/);
  assert.match(cards[1], /Descargar en Mac App Store/);
  assert.match(cards[1], /App Store · macOS 12\.0 o posterior/);
  assert.match(cards[1], /direct-download-version">Enlace alternativo · v2\.0\.2/);
  assert.match(cards[1], /class="platform-beta" href="https:\/\/testflight\.apple\.com\/join\/TsUWWH1r"/);
  assert.match(cards[2], /class="platform-download" href="\/downloads\/playworship-android-beta\.apk"/);
  assert.match(cards[3], /class="platform-download" href="https:\/\/apps\.apple\.com\/us\/app\/playworship\/id6819361132"/);
  assert.equal((html.match(/class="installation-guide-toggle"/g) || []).length, 2);
  const app = await readFile('src/App.tsx', 'utf8');
  assert.doesNotMatch(app, /ReleaseHighlights/);
});

test('the native Microsoft Store link is an explicit Windows-only option', t => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'navigator', original);
    else delete globalThis.navigator;
  });
  const renderFor = userAgent => {
    Object.defineProperty(globalThis, 'navigator', {configurable: true, value: {userAgent}});
    return renderToStaticMarkup(React.createElement(Downloads));
  };
  assert.equal(MICROSOFT_STORE_ID, '9MVD14L6PFCR');
  assert.equal(MICROSOFT_STORE_URL, 'https://apps.microsoft.com/detail/9MVD14L6PFCR');
  assert.equal(MICROSOFT_STORE_DEEP_LINK, 'ms-windows-store://pdp/?productid=9MVD14L6PFCR');
  const windows = renderFor('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  assert.ok(windows.includes(`href="${MICROSOFT_STORE_DEEP_LINK}"`));
  assert.match(windows, /Abrir en la app de Microsoft Store/);
  const mac = renderFor('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
  assert.doesNotMatch(mac, /ms-windows-store:/);
  assert.ok(mac.includes(`href="${MICROSOFT_STORE_URL}"`));
});

test('summary rejects malformed dates, excessive highlights, paths and embedded full documents', () => {
  for (const mutate of [r => {r.version = '../other';}, r => {r.publishedAt = '2026-02-30T00:00:00Z';},
    r => {r.highlights = ['x','x','x','x'];}, r => {r.summary = '';}, r => {r.changes = [];},
    r => {r.distribution = [];}, r => {r.detailsFile = 'https://other.invalid/doc';}, r => {r.platforms = ['invented'];}]) {
    const copy = structuredClone(snapshot); mutate(copy.release); assert.throws(() => parseReleaseSummary(copy));
  }
  assert.throws(() => helpReleaseURL('../other'));
});

test('fetch requests only latest summary anonymously and rejects network/schema failures', async () => {
  const value = await fetchReleaseSummary(new AbortController().signal, async (url, options) => {
    assert.equal(url, RELEASE_SUMMARY_URL); assert.equal(options.credentials, 'omit');
    return new Response(JSON.stringify(snapshot));
  });
  assert.equal(value.version, snapshot.release.version);
  for (const response of [new Response('', {status: 404}), new Response('{}'), new Response('x'.repeat(16 * 1024 + 1))])
    await assert.rejects(fetchReleaseSummary(new AbortController().signal, async () => response));
});

test('older cached metadata cannot demote the bundled release', () => {
  assert.equal(newerOrEqual('2.10.0','2.9.0'), true);
  assert.equal(newerOrEqual('2.3.6','2.4.0'), false);
  assert.equal(newerOrEqual('2.4.0','2.4.0'), true);
});
