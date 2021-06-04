import debug from "debug"

import {IProfile} from "../interfaces"
import {IProfileFilter} from "./interfaces"


const NAME = 'NonBusiness'
const log = debug('Filter').extend(NAME)

export class NonBusinessProfileFilter implements IProfileFilter {
  name: string = NAME

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
