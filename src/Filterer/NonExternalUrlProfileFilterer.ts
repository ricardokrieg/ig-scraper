import {IProfileFilterer, IProfile} from "../interfaces"
import debug from "debug"


const NAME = 'NonExternalUrl'
const log = debug('Filterer').extend(NAME)

export class NonExternalUrlProfileFilterer implements IProfileFilterer {
  name: string = NAME

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
