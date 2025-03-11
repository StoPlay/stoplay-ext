export function isServiceWorker() {
  return typeof window === 'undefined' && typeof self !== 'undefined';
}
