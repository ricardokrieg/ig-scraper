import {IProfileFilterer, IProfile} from "../interfaces"
import debug from "debug"


const NAME = 'NonProfessional'
const log = debug('Filterer').extend(NAME)

export class NonProfessionalProfileFilterer implements IProfileFilterer {
  name: string = NAME

  check(profile: IProfile): boolean {
    if (!profile.is_professional_account) {
      log(`${profile.full_name} (${profile.username}) PASS`)

      return true
    } else {
      log(`${profile.full_name} (${profile.username}) FAIL`)

      return false
    }
  }
}
