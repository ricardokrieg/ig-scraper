import {map, pick} from "lodash"

import {IFollower} from "../interfaces"


export default class FollowersParser {
  static parse(users: any[]): IFollower[] {
    return map(users, (user) => {
      const follower: IFollower = {
        ...pick(
          user,
          ['username', 'full_name', 'has_anonymous_profile_picture', 'is_private', 'is_verified', 'profile_pic_url']
        ),
        id: user.pk,
      }

      return follower
    })
  }
}
