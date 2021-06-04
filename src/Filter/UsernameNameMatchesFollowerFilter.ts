import debug from "debug"
import { some } from "lodash"

import {IFollowerFilter} from "./interfaces"
import {IFollower} from "../interfaces"


const NAME = 'UsernameNameMatches'
const log = debug('Filter').extend(NAME)

export class UsernameNameMatchesFollowerFilter implements IFollowerFilter {
  name: string = NAME

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
