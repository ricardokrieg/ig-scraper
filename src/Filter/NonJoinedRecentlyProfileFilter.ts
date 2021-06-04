import debug from "debug"

import {IProfile} from "../interfaces"
import {IProfileFilter} from "./interfaces"


const NAME = 'NonJoinedRecently'
const log = debug('Filter').extend(NAME)

export class NonJoinedRecentlyProfileFilter implements IProfileFilter {
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
