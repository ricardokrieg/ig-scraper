import debug from 'debug'
Promise = require('bluebird')

import Scorer from './Scorer'
import IGScraper from '../IGScraper'
import {
  IFollower,
  IFollowerFilterer,
  IProfileFilterer,
  IScoreRequest,
  IScrapeFollowers
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
import fs from "fs";
import csv from "csv-parser";
import {prepareMaleNames} from "../utils";


const log = debug('Scorer').extend('RealMaleScorer')


interface FollowerFiltererStatus {
  filterer: IFollowerFilterer,
  count: number,
  failed: number,
}

interface ProfileFiltererStatus {
  filterer: IProfileFilterer,
  count: number,
  failed: number,
}

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

interface IFollowerResult {
  follower: IFollower,
  status: boolean,
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
    const targetFollowers: IScrapeFollowers = {
      id: scoreRequest.profile!.id,
      limit: scoreRequest.limit,
      cookies: `ig_did=B0B787F1-FFC9-4968-9360-49E87C522A2B; ig_nrcb=1; mid=YGCSRwAEAAF5mYEy03FhLhp4Kkwi; shbid=11211; rur=ASH; shbts=1621855643.8523397; csrftoken=3Lv4TTvntYhY7G4Q0zagNwG5PW55Om3r; ds_user_id=47889665346; sessionid=47889665346%3AUnSNqRagUkQELt%3A8; ig_direct_region_hint=ASH`,
      queryHash: `5aefa9893005572d237da5068082d8d5`,
    }

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
        // new NonProfessionalProfileFilterer(),
        new NonJoinedRecentlyProfileFilterer(),
        // new HasMinPostCountProfileFilterer(),
        // new IsActiveProfileFilterer(),
        new FakeProfileFilterer(),
      ])

      const igScraper = new IGScraper()

      const followersToCheck = []

      for await (let follower of igScraper.followers(targetFollowers)) {
        followersToCheck.push(RealMaleScorer.checkFollower(follower, igScraper, followerFilterers, profileFilterers, scoreRequest.detailed))
      }

      const results = await Promise.all(followersToCheck)

      let originalCount = 0
      let scoreCount = 0

      for (let result of results) {
        originalCount++

        if (result.status) {
          scoreCount++
        }
      }

      if (originalCount === 0) return resolve(0)

      for (let filtererStatus of followerFilterers.filtererStatus) {
        const { filterer, count, failed } = filtererStatus

        log(`${filterer.name}: ${(100 * (failed / count)).toFixed(2)}% failed`)
      }

      for (let filtererStatus of profileFilterers.filtererStatus) {
        const { filterer, count, failed } = filtererStatus

        log(`${filterer.name}: ${(100 * (failed / count)).toFixed(2)}% failed`)
      }

      resolve(scoreCount / originalCount)
    })
  }

  private static async checkFollower(follower: IFollower, igScraper: IGScraper, followerFilterers: FollowerFilterers, profileFilterers: ProfileFilterers, detailed: boolean): Promise<IFollowerResult> {
    let status = true

    for (let filtererStatus of followerFilterers.filtererStatus) {
      const filterer = filtererStatus.filterer

      filtererStatus.count++
      if (!filterer.check(follower)) {
        filtererStatus.failed++
        status = false
        if (!detailed) {
          return Promise.resolve({
            follower,
            status,
          })
        }
      }
    }

    try {
      const profile = await igScraper.profile(follower.username)

      for (let filtererStatus of profileFilterers.filtererStatus) {
        const filterer = filtererStatus.filterer

        filtererStatus.count++
        if (!filterer.check(profile)) {
          filtererStatus.failed++
          status = false
          if (!detailed) {
            return Promise.resolve({
              follower,
              status,
            })
          }
        }
      }
    } catch (err) {
      log(`${follower.full_name} (${follower.username}) Failed to fetch profile`)
      console.error(err)
      status = false
    }

    return Promise.resolve({
      follower,
      status,
    })
  }
}
