import debug from "debug"
import {some} from "lodash"

import {IProfile} from "../interfaces"
import {IProfileFilter} from "./interfaces"


const NAME = 'IsActive'
const log = debug('Filter').extend(NAME)
const THRESHOLD = 30 * 24 * 60 * 60 // 30 days

export class IsActiveProfileFilter implements IProfileFilter {
  name: string = NAME

  check(profile: IProfile): boolean {
    const oneMonthAgo = Math.floor(new Date().getTime() / 1000) - THRESHOLD

    if (some(profile.posts, (post) => post.timestamp > oneMonthAgo)) {
      log(`${profile.full_name} (${profile.username}) PASS`)

      return true
    } else {
      log(`${profile.full_name} (${profile.username}) FAIL`)

      return false
    }
  }
}
