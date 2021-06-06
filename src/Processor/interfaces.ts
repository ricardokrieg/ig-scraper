import {IFollower, IProfile} from "../interfaces"

export interface IFollowersProcessor {
  process: (followers: IFollower[]) => Promise<void>
}

export interface IProfileProcessor {
  process: (profile: IProfile) => Promise<void>
}
