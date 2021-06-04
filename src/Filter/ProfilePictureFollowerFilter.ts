import debug from "debug"

import {IFollower} from "../interfaces"
import {IFollowerFilter} from "./interfaces"


const NAME = 'ProfilePicture'
const log = debug('Filter').extend(NAME)

export class ProfilePictureFollowerFilter implements IFollowerFilter {
  name: string = NAME

  check(follower: IFollower): boolean {
    if (follower.profile_pic_url.includes('s150x150')) {
      log(`${follower.full_name} (${follower.username}) PASS`)

      return true
    } else {
      log(`${follower.full_name} (${follower.username}) FAIL`)

      return false
    }
  }
}
