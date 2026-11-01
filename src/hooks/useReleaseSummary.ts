import {useEffect, useState} from 'react';
import snapshot from '../generated/release-summary.json';
import {fetchReleaseSummary, newerOrEqual, parseReleaseSummary} from '../releases/releaseSummary';
const fallback = parseReleaseSummary(snapshot);
export function useReleaseSummary() {
  const [release, setRelease] = useState(fallback);
  const [usingFallback, setUsingFallback] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    fetchReleaseSummary(controller.signal).then(value => {
      if (!controller.signal.aborted && newerOrEqual(value.version, fallback.version)) {
        setRelease(value); setUsingFallback(false);
      }
    }).catch(() => { /* Preserve the dated generated snapshot, not an invented release. */ })
      .finally(() => clearTimeout(timer));
    return () => {controller.abort(); clearTimeout(timer);};
  }, []);
  return {release, usingFallback};
}
