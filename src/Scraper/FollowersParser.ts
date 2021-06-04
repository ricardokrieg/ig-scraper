import {map, pick} from "lodash"

import {IFollower} from "../interfaces"


export default class FollowersParser {
  static parse(nodes: any[]): IFollower[] {
    return map(nodes, (node) => {
      const latestReelMedia = node.reel.latest_reel_media

      const follower: IFollower = {
        ...pick(
          node,
          ['id', 'username', 'full_name', 'profile_pic_url', 'is_private', 'is_verified']
        ),
        has_reel: latestReelMedia !== 0 && latestReelMedia !== null,
      }

      return follower
    })
  }
}
