import debug from 'debug'
import { every } from 'lodash'

import {IFollowersProcessor} from "./interfaces"
import {IFollower} from "../interfaces"
import {IJobStore} from "../Job/interfaces"
import {IFollowerFilter} from "../Filter/interfaces"
import {
  MaleFollowerFilter,
  NonPrivateFollowerFilter,
  NonVerifiedFollowerFilter,
  UsernameNameMatchesFollowerFilter
} from "../Filter"
import prepareMaleNames from "../Utils/PrepareMaleNames"


export default class FollowersProcessor implements IFollowersProcessor {
  private readonly log: any

  private readonly jobStore: IJobStore
  private readonly queueUrl: string
  private readonly filters: IFollowerFilter[]

  private constructor(jobStore: IJobStore, queueUrl: string, filters: IFollowerFilter[]) {
    this.jobStore = jobStore
    this.queueUrl = queueUrl
    this.filters = filters

    this.log = debug('FollowersProcessor')
  }

  static async NonFakeMale(jobStore: IJobStore, queueUrl: string): Promise<FollowersProcessor> {
    const maleFollowerFilter = new MaleFollowerFilter()
    maleFollowerFilter.names = await prepareMaleNames()

    const filters: IFollowerFilter[] = [
      maleFollowerFilter,
      new NonPrivateFollowerFilter(),
      new NonVerifiedFollowerFilter(),
      new UsernameNameMatchesFollowerFilter(),
    ]

    return Promise.resolve(new FollowersProcessor(jobStore, queueUrl, filters))
  }

  async process(followers: IFollower[]): Promise<void> {
    this.log(`Going to process ${followers.length} followers`)

    for (let follower of followers) {
      this.log(`Processing ${follower.username}`)

      if (this.passFilters(follower)) {
        const {username} = follower

        this.log(`Adding ${username} to Queue ${this.queueUrl}`)

        await this.jobStore.addProfileJob(this.queueUrl, { username })
      }
    }

    return Promise.resolve()
  }

  private passFilters(follower: IFollower): boolean {
    return every(this.filters, (filter) => filter.check(follower))
  }
}
