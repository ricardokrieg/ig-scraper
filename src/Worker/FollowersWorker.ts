import {IFollowersScraper, IFollowersScrapeRequest} from "../Scraper/interfaces"
import FollowersScraper from "../Scraper/FollowersScraper"
import {IFollowersProcessor} from "../Processor/interfaces"
import debug from "debug";
import {IDynamoFollowersItem, IDynamoGetItem, IDynamoService} from "../Dynamo/interfaces";
import LocalProxyService from "../Proxy/LocalProxyService";


export default class FollowersWorker {
  id: string

  protected service: IDynamoService
  protected getItem: IDynamoGetItem
  protected proxy?: string
  protected proxyService: LocalProxyService

  protected readonly log: any

  private readonly scraper: IFollowersScraper
  private readonly processor: IFollowersProcessor

  constructor(id: string, service: IDynamoService, getItem: IDynamoGetItem, processor: IFollowersProcessor) {
    this.id = id
    this.service = service
    this.getItem = getItem
    this.proxyService = LocalProxyService.getInstance()

    this.log = debug('FollowersWorker').extend(id)

    this.scraper = FollowersScraper.getInstance()
    this.processor = processor
  }

  async run(): Promise<void> {
    this.log(`Start`)

    const item = await this.service.getFollowersItem(this.getItem)
    this.log(item)

    try {
      await this.ensureProxy()

      this.log(`Processing item...`)
      await this.process(item)
      this.log(`Processed`)
    } catch (err) {
      this.log(`Failed to process item`)

      if (err.message.startsWith('429 - ')) {
        this.log(`Page Not Found (429)`)
      } else {
        this.log(err.message)
      }

      await this.proxyService.reject(this.proxy!)
      this.proxy = undefined
    }
  }

  private async ensureProxy() {
    if (this.proxy) return

    this.log(`Getting new proxy...`)
    this.proxy = await this.proxyService.proxy()
  }

  async process(item: IDynamoFollowersItem): Promise<void> {
    const followersScrapeRequest: IFollowersScrapeRequest = {
      id: item.id,
      maxId: item.maxId,
      proxy: this.proxy!,
    }

    const onScrapedPage = async (nextMaxId: number) => {
      this.log(`next_max_id: ${nextMaxId}`)

      return this.service.addFollowersItem({ table: this.getItem.table, item: { ...item, maxId: nextMaxId } })
    }

    for await (let followers of this.scraper.scrape(followersScrapeRequest, onScrapedPage, 'followers')) {
      this.log(`Got ${followers.length} followers`)

      // await this.processor.process(followers)
      await this.processor.processForIPhonePrizes(followers)
    }
  }
}
