import debug from "debug"

import {IFollower} from "../interfaces"
import {IFollowerFilter} from "./interfaces"


const NAME = 'NonVerified'
const log = debug('Filter').extend(NAME)

export class NonVerifiedFollowerFilter implements IFollowerFilter {
  name: string = NAME

  check(follower: IFollower): boolean {
    if (!follower.is_verified) {
      log(`${follower.full_name} (${follower.username}) PASS`)

      return true
    } else {
      log(`${follower.full_name} (${follower.username}) FAIL`)

      return false
    }
  }
}
