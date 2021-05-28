import {IProfileFilterer, IProfile} from "../interfaces"
import debug from "debug"


const log = debug('HasMaxFollowingCountProfileFilterer')

export class HasMaxFollowingCountProfileFilterer implements IProfileFilterer {
  check(profile: IProfile): boolean {
    if (profile.following_count < 3000) {
      log(`${profile.full_name} (${profile.username}) PASS`)

      return true
    } else {
      log(`${profile.full_name} (${profile.username}) FAIL`)

      return false
    }
  }
}
