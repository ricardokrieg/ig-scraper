import {IProfileFilterer, IProfile} from "../interfaces"
import debug from "debug"


const log = debug('NonExternalUrlProfileFilterer')

export class NonExternalUrlProfileFilterer implements IProfileFilterer {
  check(profile: IProfile): boolean {
    if (!profile.external_url) {
      log(`${profile.full_name} (${profile.username}) PASS`)

      return true
    } else {
      log(`${profile.full_name} (${profile.username}) FAIL`)

      return false
    }
  }
}
