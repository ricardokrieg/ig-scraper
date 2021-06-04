import debug from "debug"

import {IProfileScraper, IProfileScrapeRequest, IRequester} from "./interfaces"
import {IProfile} from "../interfaces"
import Requester from "./Requester"
import ProfileParser from "./ProfileParser"


export default class ProfileScraper implements IProfileScraper {
  private readonly log: any
  private readonly requester: IRequester

  constructor() {
    this.log = debug('ProfileScraper')
    this.requester = Requester.guest()
  }

  async scrape(profileScrapeRequest: IProfileScrapeRequest): Promise<IProfile> {
    const url = `/${profileScrapeRequest.username}/`
    const options = { proxy: profileScrapeRequest.proxy, url }

    this.log(`Scraping ${url}`)

    try {
      const response = await this.requester.send(options)
      this.log(`Response Status: ${response.statusCode}`)

      const profile = ProfileParser.parse(response.body)

      return Promise.resolve(profile)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
