import debug from 'debug'
Promise = require('bluebird')

import Scorer from './Scorer'
import {
  FollowerFiltererStatus,
  IFollower,
  IFollowerFilterer, IFollowerResult, IProfile,
  IProfileFilterer,
  IScoreRequest,
  ProfileFiltererStatus
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
import WorkerManager from "../Worker/WorkerManager";
import { countBy } from 'lodash'


const log = debug('Scorer').extend('RealMaleScorer')

class FollowerFilterers {
  filtererStatus: FollowerFiltererStatus[] = []

  constructor(filterers: IFollowerFilterer[]) {
    for (let filterer of filterers) {
      this.filtererStatus.push({
        filterer,
        count: 0,
        failed: 0,
      })
    }
  }
}

class ProfileFilterers {
  filtererStatus: ProfileFiltererStatus[] = []

  constructor(filterers: IProfileFilterer[]) {
    for (let filterer of filterers) {
      this.filtererStatus.push({
        filterer,
        count: 0,
        failed: 0,
      })
    }
  }
}

export default class RealMaleScorer extends Scorer {
  computeScore(scoreRequest: IScoreRequest): Promise<number> {
    return new Promise(async resolve => {
      const maleNames = await prepareMaleNames()
      const maleFollowerFilterer = new MaleFollowerFilterer()
      maleFollowerFilterer.names = maleNames

      const followerFilterers = new FollowerFilterers([
        maleFollowerFilterer,
        new NonPrivateFollowerFilterer(),
        new NonVerifiedFollowerFilterer(),
        new ProfilePictureFollowerFilterer(),
        new UsernameNameMatchesFollowerFilterer(),
      ])

      const profileFilterers = new ProfileFilterers([
        new NonExternalUrlProfileFilterer(),
        new NonBusinessProfileFilterer(),
        // new NonProfessionalProfileFilter(),
        new NonJoinedRecentlyProfileFilterer(),
        // new HasMinPostCountProfileFilter(),
        // new IsActiveProfileFilter(),
        new FakeProfileFilterer(),
      ])

      const followersToCheck = []
      const workerManager = WorkerManager.getInstance()
      const results: IFollowerResult[] = await workerManager.filterFollowers(
        4,
        this.followers,
        (follower: IFollower): Promise<IFollowerResult> => {
          let status = true

          for (let filtererStatus of followerFilterers.filtererStatus) {
            const filterer = filtererStatus.filterer

            filtererStatus.count++
            if (!filterer.check(follower)) {
              filtererStatus.failed++
              status = false
              if (!scoreRequest.detailed) {
                return Promise.resolve({
                  follower,
                  status: false,
                })
              }
            }
          }

          return Promise.resolve({
            follower,
            status,
          })
        },
        (profile: IProfile): Promise<IFollowerResult> => {
          let status = true
          const follower = {
            username: profile.username,
            id: profile.id,
            full_name: profile.full_name,
            profile_pic_url: profile.profile_pic_url,
            is_private: profile.is_private,
            is_verified: profile.is_verified,
            has_reel: false,
          }

          for (let filtererStatus of profileFilterers.filtererStatus) {
            const filterer = filtererStatus.filterer

            filtererStatus.count++
            if (!filterer.check(profile)) {
              filtererStatus.failed++
              status = false
              if (!scoreRequest.detailed) {
                return Promise.resolve({
                  follower,
                  status: false,
                })
              }
            }
          }

          return Promise.resolve({
            follower,
            status,
          })
        },
        scoreRequest.detailed
      )

      let originalCount = results.length
      let scoreCount = countBy(results, (result) => result.status)['true'] || 0

      for (let filtererStatus of followerFilterers.filtererStatus) {
        const { filterer, count, failed } = filtererStatus

        log(`${filterer.name}: ${(100 * (failed / count)).toFixed(2)}% failed`)
      }

      for (let filtererStatus of profileFilterers.filtererStatus) {
        const { filterer, count, failed } = filtererStatus

        log(`${filterer.name}: ${(100 * (failed / count)).toFixed(2)}% failed`)
      }

      originalCount === 0 ? resolve(0) : resolve(scoreCount / originalCount)
    })
  }
}
