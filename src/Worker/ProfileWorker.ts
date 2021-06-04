import BaseWorker from "./BaseWorker"
import {IJobRequest, IJobStore, IProfileJob} from "../Job/interfaces"
import debug from "debug"
import ProfileScraper from "../Scraper/ProfileScraper"
import {IProfile} from "../interfaces"
import {IProfileScraper, IProfileScrapeRequest} from "../Scraper/interfaces"
import {IProxyService} from "../Proxy/interfaces"
import LocalProxyService from "../Proxy/LocalProxyService";


export default class ProfileWorker extends BaseWorker {
  private readonly log: any

  private proxy?: string
  private proxyService: IProxyService
  private profileScraper: IProfileScraper

  constructor(id: string, jobStore: IJobStore, jobRequest: IJobRequest) {
    super(id, jobStore, jobRequest)

    this.proxyService = LocalProxyService.getInstance()
    this.profileScraper = ProfileScraper.getInstance()

    this.log = debug('ProfileWorker').extend(this.id)
  }

  async run(): Promise<void> {
    this.log(`Start`)

    await this.ensureProxy()

    while (true) {
      try {
        const job: IProfileJob = await this.jobStore.getProfileJob(this.jobRequest)

        this.log(`Processing job`)
        this.log(job)

        const profileScrapeRequest: IProfileScrapeRequest = {
          username: job.username,
          proxy: this.proxy!,
        }
        const profile: IProfile = await this.profileScraper.scrape(profileScrapeRequest)

        // TODO process with ....?

        this.log(`Processed`)
        this.log(`Removing job`)

        await this.jobStore.removeJob(this.jobRequest, job)
      } catch (err) {
        this.log(`Failed to get job. Exiting...`)
        return Promise.resolve()
      }
    }
  }

  private async ensureProxy() {
    if (this.proxy) return

    this.log(`Getting new proxy...`)
    this.proxy = await this.proxyService.proxy()
  }
}
