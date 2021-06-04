import {IFollowerFilterer, IFollower} from "../interfaces"
import debug from "debug"
import csv from 'csv-parser'
import fs from 'fs'
import { some } from "lodash"


const NAME = 'Male'
const log = debug('Filterer').extend(NAME)

export class MaleFollowerFilterer implements IFollowerFilterer {
  name: string = NAME

  names: string[] = []

  check(follower: IFollower): boolean {
    const fullName = follower.full_name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/_/gi, ' ')
      .replace(/[^a-z\ ]/gi, '')

    const splitFullName = fullName.split(' ')

    if (some(splitFullName, (name) => this.names.includes(name.toUpperCase()))) {
      log(`${follower.full_name} (${follower.username}) PASS`)

      return true
    } else {
      log(`${follower.full_name} (${follower.username}) FAIL`)

      return false
    }
  }
}
