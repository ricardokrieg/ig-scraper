import debug from "debug"
import { isEmpty } from "lodash"

import {IFollower} from "../interfaces"
import {IFollowerFilter} from "./interfaces"


const NAME = 'FullName'
const log = debug('Filter').extend(NAME)

export class FullNameFollowerFilter implements IFollowerFilter {
  name: string = NAME

  check(follower: IFollower): boolean {
    if (isEmpty(follower.full_name)) {
      log(`${follower.full_name} (${follower.username}) FAIL`)

      return false
    } else {
      log(`${follower.full_name} (${follower.username}) PASS`)

      return true
    }
  }
}
