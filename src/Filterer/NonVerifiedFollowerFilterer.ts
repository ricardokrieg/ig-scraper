import {IFollowerFilterer, IFollower} from "../interfaces"
import debug from "debug"


const NAME = 'NonVerified'
const log = debug('Filterer').extend(NAME)

export class NonVerifiedFollowerFilterer implements IFollowerFilterer {
  name: string = NAME

  check(follower: IFollower): boolean {
    if (!follower.is_verified) {
      log(`${follower.full_name} (${follower.username}) PASS`)

      return true
    } else {
      log(`${follower.full_name} (${follower.username}) FAIL`)

      return false
    }
  }
}
