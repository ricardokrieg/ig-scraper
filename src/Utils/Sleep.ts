export default function sleep(ms: number, maxMs?: number) {
  if (maxMs) {
    ms = Math.floor(Math.random() * (maxMs - ms + 1) + ms)
  }

  return new Promise(resolve => setTimeout(resolve, ms))
}
