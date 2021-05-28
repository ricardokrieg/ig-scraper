import {IProfileFilterer, IProfile} from "../interfaces"
import debug from "debug"


const log = debug('NonBusinessProfileFilterer')

export class NonBusinessProfileFilterer implements IProfileFilterer {
  check(profile: IProfile): boolean {
    if (!profile.is_business_account) {
      log(`${profile.full_name} (${profile.username}) PASS`)

      return true
    } else {
      log(`${profile.full_name} (${profile.username}) FAIL`)

      return false
    }
  }
}
