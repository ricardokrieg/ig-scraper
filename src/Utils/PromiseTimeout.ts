export default function promiseTimeout(ms: number, promise: any) {
  // Create a promise that rejects in <ms> milliseconds
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error('Timed out in '+ ms + 'ms.'))
    }, ms)
  })

  return Promise.race([
    promise,
    timeout
  ])
}
