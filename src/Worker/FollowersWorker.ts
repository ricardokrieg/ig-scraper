import BaseWorker from "./BaseWorker"
import {IFollowersJob, IJob, IJobRequest, IJobStore} from "../Job/interfaces"
import LocalProxyService from "../Proxy/LocalProxyService"
import {IFollowersScraper, IFollowersScrapeRequest} from "../Scraper/interfaces"
import FollowersScraper from "../Scraper/FollowersScraper"
import {IFollowersProcessor} from "../Processor/interfaces"


export default class FollowersWorker extends BaseWorker {
  private readonly scraper: IFollowersScraper
  private readonly processor: IFollowersProcessor

  constructor(id: string, jobStore: IJobStore, jobRequest: IJobRequest, processor: IFollowersProcessor) {
    super(
      id,
      'FollowersWorker',
      jobStore,
      jobRequest,
      LocalProxyService.getInstance(),
    )

    this.scraper = FollowersScraper.getInstance()
    this.processor = processor
  }

  async process(job: IFollowersJob): Promise<void> {
    const followersScrapeRequest: IFollowersScrapeRequest = {
      id: job.id,
      after: job.after,
      proxy: this.proxy!,
    }

    for await (let followers of this.scraper.scrape(followersScrapeRequest)) {
      this.log(`Got ${followers.length} followers`)

      await this.processor.process(followers)
    }
  }

  async getJob(): Promise<IJob> {
    return this.jobStore.getFollowersJob(this.jobRequest)
  }
}
