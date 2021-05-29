import debug from 'debug'
Promise = require('bluebird')

import IGScraper from '../IGScraper'
import {
  IFollower,
  IFollowerFilterer,
  IProfileFilterer,
} from '../interfaces'
import {
  FakeProfileFilterer,
  MaleFollowerFilterer,
  NonBusinessProfileFilterer,
  NonExternalUrlProfileFilterer,
  NonJoinedRecentlyProfileFilterer,
  NonPrivateFollowerFilterer,
  NonVerifiedFollowerFilterer,
  ProfilePictureFollowerFilterer,
  UsernameNameMatchesFollowerFilterer
} from '../Filterer'
import {prepareMaleNames} from "../utils"


const log = debug('Processor').extend('RealMaleProcessor')

export default class RealMaleProcessor {
  igScraper: IGScraper = new IGScraper()
  followerFilterers: IFollowerFilterer[] = []
  profileFilterers: IProfileFilterer[] = []

  async prepare() {
    const maleNames = await prepareMaleNames()
    const maleFollowerFilterer = new MaleFollowerFilterer()
    maleFollowerFilterer.names = maleNames

    this.followerFilterers = [
      maleFollowerFilterer,
      new NonPrivateFollowerFilterer(),
      new NonVerifiedFollowerFilterer(),
      new ProfilePictureFollowerFilterer(),
      new UsernameNameMatchesFollowerFilterer(),
    ]

    this.profileFilterers = [
      new NonExternalUrlProfileFilterer(),
      new NonBusinessProfileFilterer(),
      new NonJoinedRecentlyProfileFilterer(),
      new FakeProfileFilterer(),
    ]
  }

  async process(follower: IFollower): Promise<boolean> {
    for (let filterer of this.followerFilterers) {
      if (!filterer.check(follower)) {
        log(`${follower.full_name} (${follower.username}) FAIL ${filterer.name}`)
        return Promise.resolve(false)
      }
    }

    try {
      const profile = await this.igScraper.profile(follower.username)

      for (let filterer of this.profileFilterers) {
        if (!filterer.check(profile)) {
          log(`${follower.full_name} (${follower.username}) FAIL ${filterer.name}`)
          return Promise.resolve(false)
        }
      }
    } catch (err) {
      log(`${follower.full_name} (${follower.username}) Failed to fetch profile`)
      console.error(err)
      return Promise.resolve(false)
    }

    log(`${follower.full_name} (${follower.username}) PASS`)
    return Promise.resolve(true)
  }
}
