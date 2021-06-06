import debug from 'debug'
import { every } from 'lodash'

import {IProfileProcessor} from "./interfaces"
import {IProfile} from "../interfaces"
import {IJobStore} from "../Job/interfaces"
import {IProfileFilter} from "../Filter/interfaces"
import {
  FakeProfileFilter,
  NonBusinessProfileFilter,
  NonExternalUrlProfileFilter,
  NonJoinedRecentlyProfileFilter,
} from "../Filter"


export default class ProfileProcessor implements IProfileProcessor {
  private readonly log: any

  private readonly jobStore: IJobStore
  private readonly queueUrl: string
  private readonly filters: IProfileFilter[]

  private constructor(jobStore: IJobStore, queueUrl: string, filters: IProfileFilter[]) {
    this.jobStore = jobStore
    this.queueUrl = queueUrl
    this.filters = filters

    this.log = debug('ProfileProcessor')
  }

  static async NonFakeMale(jobStore: IJobStore, queueUrl: string): Promise<ProfileProcessor> {
    const filters: IProfileFilter[] = [
      new NonBusinessProfileFilter(),
      new NonExternalUrlProfileFilter(),
      new NonJoinedRecentlyProfileFilter(),
      new FakeProfileFilter(),
      // new HasMinPostCountProfileFilter(),
      // new IsActiveProfileFilter(),
      // new NonProfessionalProfileFilter(),
    ]

    return Promise.resolve(new ProfileProcessor(jobStore, queueUrl, filters))
  }

  async process(profile: IProfile): Promise<void> {
    this.log(`Processing ${profile.username}`)

    if (this.passFilters(profile)) {
      const {username} = profile

      this.log(`Adding ${username} to Queue ${this.queueUrl}`)

      await this.jobStore.addDMJob(this.queueUrl, { username })
    }

    return Promise.resolve()
  }

  private passFilters(profile: IProfile): boolean {
    return every(this.filters, (filter) => filter.check(profile))
  }
}
