import {IFollowerFilterer, IFollower} from "../interfaces"
import debug from "debug"
import csv from 'csv-parser'
import fs from 'fs'
import { some } from "lodash"


const log = debug('UsernameNameMatchesFollowerFilterer')

export class UsernameNameMatchesFollowerFilterer implements IFollowerFilterer {
  check(follower: IFollower): boolean {
    const fullName = follower.full_name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/_/gi, ' ')
      .replace(/[^a-z\ ]/gi, '')

    const splitFullName = fullName.split(' ')

    if (some(splitFullName, (name) => follower.username.toUpperCase().includes(name.toUpperCase()))) {
      log(`${follower.full_name} (${follower.username}) PASS`)

      return true
    } else {
      log(`${follower.full_name} (${follower.username}) FAIL`)

      return false
    }
  }
}
