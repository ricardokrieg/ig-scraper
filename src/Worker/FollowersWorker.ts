import BaseWorker from "./BaseWorker"
import {IFollowersJob, IJob, IJobRequest, IJobStore} from "../Job/interfaces"
import LocalProxyService from "../Proxy/LocalProxyService"
import {IFollowersScraper, IFollowersScrapeRequest} from "../Scraper/interfaces"
import FollowersScraper from "../Scraper/FollowersScraper"
import {IFollower} from "../interfaces"


export default class FollowersWorker extends BaseWorker {
  private readonly scraper: IFollowersScraper

  constructor(id: string, jobStore: IJobStore, jobRequest: IJobRequest) {
    super(
      id,
      'FollowersWorker',
      jobStore,
      jobRequest,
      LocalProxyService.getInstance(),
    )

    this.scraper = FollowersScraper.getInstance()
  }

  async process(job: IFollowersJob): Promise<void> {
    const followersScrapeRequest: IFollowersScrapeRequest = {
      id: job.id,
      after: job.after,
      proxy: this.proxy!,
    }

    const followers: IFollower[] = await this.scraper.scrape(followersScrapeRequest)
    this.log(`Got ${followers.length} followers`)
  }

  async getJob(): Promise<IJob> {
    return this.jobStore.getFollowersJob(this.jobRequest)
  }
}
