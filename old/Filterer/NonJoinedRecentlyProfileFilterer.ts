import {IProfileFilterer, IProfile} from "../interfaces"
import debug from "debug"


const NAME = 'NonJoinedRecently'
const log = debug('Filterer').extend(NAME)

export class NonJoinedRecentlyProfileFilterer implements IProfileFilterer {
  name: string = NAME

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
