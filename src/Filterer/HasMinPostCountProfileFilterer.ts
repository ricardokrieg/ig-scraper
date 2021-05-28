import {IProfileFilterer, IProfile} from "../interfaces"
import debug from "debug"


const log = debug('HasMinPostCountProfileFilterer')

export class HasMinPostCountProfileFilterer implements IProfileFilterer {
  check(profile: IProfile): boolean {
    if (profile.post_count > 3) {
      log(`${profile.full_name} (${profile.username}) PASS`)

      return true
    } else {
      log(`${profile.full_name} (${profile.username}) FAIL`)

      return false
    }
  }
}
