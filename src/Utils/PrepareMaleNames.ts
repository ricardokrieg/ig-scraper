import fs from "fs"
import csv from "csv-parser"
import debug from 'debug'


const log = debug('PrepareMaleNames')

export default function prepareMaleNames(): Promise<string[]> {
  const names: string[] = []

  return new Promise(resolve => {
    fs.createReadStream('./resources/grupos.csv')
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
