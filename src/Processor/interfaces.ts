import {IFollower} from "../interfaces"

export interface IFollowersProcessor {
  process: (followers: IFollower[]) => Promise<void>
}
