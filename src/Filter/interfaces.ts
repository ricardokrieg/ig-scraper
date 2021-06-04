import {IFollower, IProfile} from "../interfaces"

export interface IFollowerFilter {
  name: string,
  check: (follower: IFollower) => boolean
}

export interface IProfileFilter {
  name: string,
  check: (profile: IProfile) => boolean
}
