import BaseWorker from "./BaseWorker"
import {IJob, IJobRequest, IJobStore, IProfileJob} from "../Job/interfaces"
import ProfileScraper from "../Scraper/ProfileScraper"
import {IProfile} from "../interfaces"
import {IProfileScraper, IProfileScrapeRequest} from "../Scraper/interfaces"
import SharedProxyService from "../Proxy/SharedProxyService";
import { pick } from "lodash"


export default class ProfileWorker extends BaseWorker {
  private readonly scraper: IProfileScraper

  constructor(id: string, jobStore: IJobStore, jobRequest: IJobRequest) {
    super(
      id,
      'ProfileWorker',
      jobStore,
      jobRequest,
      SharedProxyService.getInstance(),
    )

    this.scraper = ProfileScraper.getInstance()
  }

  async process(job: IProfileJob): Promise<void> {
    const profileScrapeRequest: IProfileScrapeRequest = {
      username: job.username,
      proxy: this.proxy!,
    }

    const profile: IProfile = await this.scraper.scrape(profileScrapeRequest)
    this.log(pick(profile, ['id', 'username']))
  }

  async getJob(): Promise<IJob> {
    return this.jobStore.getProfileJob(this.jobRequest)
  }
}
