import debug from "debug"
import { some } from "lodash"

import {IFollower} from "../interfaces"
import {IFollowerFilter} from "./interfaces"


const NAME = 'Male'
const log = debug('Filter').extend(NAME)

export class MaleFollowerFilter implements IFollowerFilter {
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
