import debug from "debug"

import {IProfile} from "../interfaces"
import {IProfileFilter} from "./interfaces"


const NAME = 'HasMinPostCount'
const log = debug('Filter').extend(NAME)
const THRESHOLD = 3

export class HasMinPostCountProfileFilter implements IProfileFilter {
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
