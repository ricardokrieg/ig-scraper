import {IFollowerFilterer, IFollower} from "../interfaces"
import debug from "debug"
import csv from 'csv-parser'
import fs from 'fs'
import { some } from "lodash"


const log = debug('MaleFollowerFilterer')

export class MaleFollowerFilterer implements IFollowerFilterer {
  names: string[] = []

  async prepare(): Promise<void> {
    return new Promise(resolve => {
      fs.createReadStream('resources/grupos.csv')
        .pipe(csv())
        .on('data', (row) => {
          if (row.classification === 'M' && parseInt(row.frequency_male) > 100) {
            this.names.push(row.name)
          }
        })
        .on('end', () => {
          log(`${this.names.length} male names`)

          resolve()
        })
    })
  }

  check(follower: IFollower): boolean {
    const fullName = follower.full_name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/_/gi, ' ')
      .replace(/[^a-z\ ]/gi, '')

    const splitFullName = fullName.split(' ')

    if (some(splitFullName, (name) => this.names.includes(name.toUpperCase()))) {
      log(`"${follower.full_name}" PASSED`)

      return true
    } else {
      log(`"${follower.full_name}" FAIL`)

      return false
    }
  }
}
