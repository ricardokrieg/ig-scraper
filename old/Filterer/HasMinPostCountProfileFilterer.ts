import {IProfileFilterer, IProfile} from "../interfaces"
import debug from "debug"


const NAME = 'HasMinPostCount'
const log = debug('Filterer').extend(NAME)
const THRESHOLD = 3

export class HasMinPostCountProfileFilterer implements IProfileFilterer {
  name: string = NAME

  check(profile: IProfile): boolean {
    if (profile.post_count > THRESHOLD) {
      log(`${profile.full_name} (${profile.username}) PASS`)

      return true
    } else {
      log(`${profile.full_name} (${profile.username}) FAIL`)

      return false
    }
  }
}
