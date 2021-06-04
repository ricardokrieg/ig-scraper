import {map} from "lodash";
import debug from "debug"

import {
  IFollowersPageInfo,
  IFollowersRequestParams,
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

  private readonly queryHash: string

  private constructor() {
    this.log = debug('FollowersScraper')

    const cookies = `ig_did=B0B787F1-FFC9-4968-9360-49E87C522A2B; ig_nrcb=1; mid=YGCSRwAEAAF5mYEy03FhLhp4Kkwi; shbid=11211; rur=ASH; shbts=1621855643.8523397; csrftoken=3Lv4TTvntYhY7G4Q0zagNwG5PW55Om3r; ds_user_id=47889665346; sessionid=47889665346%3AUnSNqRagUkQELt%3A8; ig_direct_region_hint=ASH`
    this.requester = Requester.auth(cookies)

    this.queryHash = `5aefa9893005572d237da5068082d8d5`
  }

  static getInstance(): FollowersScraper {
    if (!this.instance) {
      this.instance = new FollowersScraper()
    }

    return this.instance
  }

  async *scrape(followersScrapeRequest: IFollowersScrapeRequest): AsyncGenerator<IFollower[], void, void> {
    let hasNextPage = true
    while (hasNextPage) {
      const variables = FollowersScraper.getRequestVariables(followersScrapeRequest)
      const urlParams = `query_hash=${this.queryHash}&variables=${encodeURIComponent(JSON.stringify(variables))}`
      const url = `/graphql/query/?${urlParams}`
      const options = { proxy: followersScrapeRequest.proxy, url }

      this.log(`Scraping ${url}`)

      const response = await this.requester.send(options)
      this.log(`Response Status: ${response.statusCode}`)

      this.log(`Parsing JSON content...`)
      const body = JSON.parse(response.body)

      const edgeFollowedBy = body.data.user.edge_followed_by
      const pageInfo: IFollowersPageInfo = edgeFollowedBy.page_info
      this.log(pageInfo)

      const nodes = map(edgeFollowedBy.edges, 'node')
      const followers = FollowersParser.parse(nodes)

      yield followers

      hasNextPage = pageInfo.has_next_page
      followersScrapeRequest.after = pageInfo.end_cursor

      // TODO save updated followersScrapeRequest (save to SQS again, so that can continue from where it stopped)
    }

    return Promise.resolve()
  }

  private static getRequestVariables(followersScrapeRequest: IFollowersScrapeRequest): IFollowersRequestParams {
    return {
      id: followersScrapeRequest.id,
      include_reel: true,
      first: 50,
      after: followersScrapeRequest.after
    }
  }
}
