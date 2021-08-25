import debug from "debug"

import {
  IFollowersScraper,
  IFollowersScrapeRequest,
  IRequester
} from "./interfaces"
import Requester from "./Requester"
import FollowersParser from "./FollowersParser"
import {IFollower} from "../interfaces"


export default class FollowersScraper implements IFollowersScraper {
  private static instance: FollowersScraper
  private readonly log: any
  private readonly requester: IRequester

  private constructor() {
    this.log = debug('FollowersScraper')

    const cookies = `ig_did=B0B787F1-FFC9-4968-9360-49E87C522A2B; ig_nrcb=1; mid=YGCSRwAEAAF5mYEy03FhLhp4Kkwi; shbid=16161; rur=ASH; shbts=1623429729.713088; csrftoken=kGOZG3waz1NXVOrPOXIqFhhJiMHXNMfq; ds_user_id=48117313086; sessionid=48117313086:O2gzYO5PW5pzCN:26`
    this.requester = Requester.auth(cookies)
  }

  static getInstance(): FollowersScraper {
    if (!this.instance) {
      this.instance = new FollowersScraper()
    }

    return this.instance
  }

  async *scrape(followersScrapeRequest: IFollowersScrapeRequest, onScrapedPage: (nextMaxId: number) => Promise<void>, relationshipType: string): AsyncGenerator<IFollower[], void, void> {
    let hasNextPage = true
    while (hasNextPage) {
      const count = 12
      const maxId = followersScrapeRequest.maxId
      const url = `/api/v1/friendships/${followersScrapeRequest.id}/${relationshipType}/?count=${count}&max_id=${maxId}&search_surface=follow_list_page`
      const options = { proxy: followersScrapeRequest.proxy, url }

      this.log(`Scraping ${url}`)

      const response = await this.requester.send(options)
      this.log(`Response Status: ${response.statusCode}`)

      this.log(`Parsing JSON content...`)
      const body = JSON.parse(response.body)

      const { users, next_max_id } = body
      this.log(`next_max_id=${next_max_id}`)

      const followers = FollowersParser.parse(users)

      yield followers

      if (!!next_max_id) {
        hasNextPage = true
        followersScrapeRequest.maxId = parseInt(next_max_id)

        await onScrapedPage(followersScrapeRequest.maxId)
      } else {
        hasNextPage = false
      }
    }

    return Promise.resolve()
  }
}
