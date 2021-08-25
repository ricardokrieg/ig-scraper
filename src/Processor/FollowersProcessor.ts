import debug from 'debug'
import { every, isEmpty } from 'lodash'

import {IFollowersProcessor} from "./interfaces"
import {IFollower} from "../interfaces"
import {IIPhonePrizesJobMessage, ISQSJobStore} from "../Job/interfaces"
import {IFollowerFilter} from "../Filter/interfaces"
import {
  MaleFollowerFilter,
  NonPrivateFollowerFilter,
  NonVerifiedFollowerFilter, ProfilePictureFollowerFilter,
  UsernameNameMatchesFollowerFilter
} from "../Filter"
import prepareMaleNames from "../Utils/PrepareMaleNames"
import {FullNameFollowerFilter} from "../Filter/FullNameFollowerFilter";
import LinkCreator from "../LinkCreator/LinkCreator";
import ImageDownloader from "../ImageDownloader/ImageDownloader";
import FollowersScraper from "../Scraper/FollowersScraper";
import {IFollowersScrapeRequest} from "../Scraper/interfaces";
import LocalProxyService from "../Proxy/LocalProxyService";


export default class FollowersProcessor implements IFollowersProcessor {
  private readonly log: any

  private readonly jobStore: ISQSJobStore
  private readonly queueUrl: string
  private readonly filters: IFollowerFilter[]

  private constructor(jobStore: ISQSJobStore, queueUrl: string, filters: IFollowerFilter[]) {
    this.jobStore = jobStore
    this.queueUrl = queueUrl
    this.filters = filters

    this.log = debug('FollowersProcessor')
  }

  static async NonFakeMale(jobStore: ISQSJobStore, queueUrl: string): Promise<FollowersProcessor> {
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

  static async Switzerland(jobStore: ISQSJobStore, queueUrl: string): Promise<FollowersProcessor> {
    const filters: IFollowerFilter[] = [
      new NonPrivateFollowerFilter(),
      new NonVerifiedFollowerFilter(),
      new UsernameNameMatchesFollowerFilter(),
    ]

    return Promise.resolve(new FollowersProcessor(jobStore, queueUrl, filters))
  }

  static async Basic(jobStore: ISQSJobStore, queueUrl: string): Promise<FollowersProcessor> {
    const filters: IFollowerFilter[] = [
      new NonPrivateFollowerFilter(),
      new NonVerifiedFollowerFilter(),
      new ProfilePictureFollowerFilter(),
    ]

    return Promise.resolve(new FollowersProcessor(jobStore, queueUrl, filters))
  }

  static async IPhonePrizes(jobStore: ISQSJobStore, queueUrl: string): Promise<FollowersProcessor> {
    const filters: IFollowerFilter[] = [
      new NonPrivateFollowerFilter(),
      new NonVerifiedFollowerFilter(),
      new ProfilePictureFollowerFilter(),
      new FullNameFollowerFilter(),
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

  async processForIPhonePrizes(followers: IFollower[]): Promise<void> {
    this.log(`Going to process ${followers.length} followers (iPhone Prizes)`)

    for (let follower of followers) {
      this.log(`Processing ${follower.username}`)

      if (this.passFilters(follower)) {
        const {
          username,
          full_name,
          profile_pic_url,
        } = follower

        this.log(`Adding ${username} to Queue ${this.queueUrl}`)

        const imageDownloader = ImageDownloader.getInstance()
        const imageUrl = await imageDownloader.download(username, profile_pic_url)

        const campaignUrl = 'https://mandanudes.online/go/d61b2095-ba06-4fb6-8ffe-845d1279c62a'

        const linkCreator = LinkCreator.getInstance()
        const longUrl = linkCreator.generateLongUrl(campaignUrl, full_name, username, imageUrl)
        const link = await linkCreator.create(longUrl)

        try {
          // const tagger = await this.getTagger(follower)

          const jobMessage: IIPhonePrizesJobMessage = {
            username,
            full_name,
            link,
            // tagger_name: tagger.full_name,
            // tagger_username: tagger.username,
          }

          await this.jobStore.addIPhonePrizesJob(this.queueUrl, jobMessage)
        } catch (err) {
          this.log(`Failed to get tagger for ${follower.username}`)
        }
      }
    }

    return Promise.resolve()
  }

  private passFilters(follower: IFollower): boolean {
    return every(this.filters, (filter) => filter.check(follower))
  }

  private async getTagger(user: IFollower): Promise<IFollower> {
    const scraper = FollowersScraper.getInstance()
    const proxy = await LocalProxyService.getInstance().proxy()

    const followersScrapeRequest: IFollowersScrapeRequest = {
      id: user.id,
      maxId: 0,
      proxy,
    }

    for await (let followers of scraper.scrape(followersScrapeRequest, () => Promise.resolve(), 'followers')) {
      for (let follower of followers) {
        if (!isEmpty(follower.full_name)) {
          return Promise.resolve(follower)
        }
      }
    }

    return Promise.reject()
  }
}
