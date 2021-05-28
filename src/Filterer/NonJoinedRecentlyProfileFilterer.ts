import {IProfileFilterer, IProfile} from "../interfaces"
import debug from "debug"


const log = debug('NonJoinedRecentlyProfileFilterer')

export class NonJoinedRecentlyProfileFilterer implements IProfileFilterer {
  check(profile: IProfile): boolean {
    if (!profile.is_joined_recently) {
      log(`${profile.full_name} (${profile.username}) PASS`)

      return true
    } else {
      log(`${profile.full_name} (${profile.username}) FAIL`)

      return false
    }
  }
}
