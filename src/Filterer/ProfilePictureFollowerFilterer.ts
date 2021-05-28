import {IFollowerFilterer, IFollower} from "../interfaces"
import debug from "debug"


const log = debug('ProfilePictureFollowerFilterer')

export class ProfilePictureFollowerFilterer implements IFollowerFilterer {
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
