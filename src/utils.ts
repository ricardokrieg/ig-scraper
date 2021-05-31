import fs from "fs"
import csv from "csv-parser"
import debug from "debug"


const log = debug('utils')

export const prepareMaleNames = async (): Promise<string[]> => {
  const names: string[] = []

  return new Promise(resolve => {
    fs.createReadStream('resources/grupos.csv')
      .pipe(csv())
      .on('data', (row) => {
        if (row.classification === 'M' && parseInt(row.frequency_male) > 100) {
          names.push(row.name)
        }
      })
      .on('end', () => {
        log.extend('prepareMaleNames')(`${names.length} male names`)

        resolve(names)
      })
  })
}

export const promiseTimeout = (ms: number, promise: any) => {
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
