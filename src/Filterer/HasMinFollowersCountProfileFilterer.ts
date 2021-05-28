import {IProfileFilterer, IProfile} from "../interfaces"
import debug from "debug"


const log = debug('HasMinFollowersCountProfileFilterer')

export class HasMinFollowersCountProfileFilterer implements IProfileFilterer {
  check(profile: IProfile): boolean {
    if (profile.followers_count >= 100) {
      log(`${profile.full_name} (${profile.username}) PASS`)

      return true
    } else {
      log(`${profile.full_name} (${profile.username}) FAIL`)

      return false
    }
  }
}
