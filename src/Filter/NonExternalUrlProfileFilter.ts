import debug from "debug"

import {IProfile} from "../interfaces"
import {IProfileFilter} from "./interfaces"


const NAME = 'NonExternalUrl'
const log = debug('Filter').extend(NAME)

export class NonExternalUrlProfileFilter implements IProfileFilter {
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
