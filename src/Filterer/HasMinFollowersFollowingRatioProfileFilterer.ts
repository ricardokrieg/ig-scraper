import {IProfileFilterer, IProfile} from "../interfaces"
import debug from "debug"


const log = debug('HasMinFollowersFollowingRatioProfileFilterer')

export class HasMinFollowersFollowingRatioProfileFilterer implements IProfileFilterer {
  check(profile: IProfile): boolean {
    if (profile.following_count !== 0 && (profile.followers_count / profile.following_count) >= 0.1) {
      log(`${profile.full_name} (${profile.username}) PASS`)

      return true
    } else {
      log(`${profile.full_name} (${profile.username}) FAIL`)

      return false
    }
  }
}
