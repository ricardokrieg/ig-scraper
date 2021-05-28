import {IFollowerFilterer, IFollower} from "../interfaces"
import debug from "debug"


const log = debug('NonVerifiedFollowerFilterer')

export class NonVerifiedFollowerFilterer implements IFollowerFilterer {
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
