import debug from "debug"

import {IFollower} from "../interfaces"
import {IFollowerFilter} from "./interfaces"


const NAME = 'ProfilePicture'
const log = debug('Filter').extend(NAME)

export class ProfilePictureFollowerFilter implements IFollowerFilter {
  name: string = NAME

  check(follower: IFollower): boolean {
    if (follower.has_anonymous_profile_picture) {
      log(`${follower.full_name} (${follower.username}) FAIL`)

      return false
    } else {
      log(`${follower.full_name} (${follower.username}) PASS`)

      return true
    }
  }
}
