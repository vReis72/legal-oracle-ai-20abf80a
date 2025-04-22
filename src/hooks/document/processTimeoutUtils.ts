
export function setGlobalProcessTimeout(
  callback: () => void,
  setOrReplaceTimeout: (cb: () => void, ms: number) => void,
  ms: number
) {
  setOrReplaceTimeout(callback, ms);
}
