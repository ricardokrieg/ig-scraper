import {
  IFollower, IFollowersRequest,
  IFollowersRequestParams,
  IFollowersRequestResponse,
  IProxyService,
} from "../interfaces"
import Requester from "../Requester";
import {retry} from "@lifeomic/attempt";
import {isEmpty, map, pick} from "lodash";
import debug from "debug";
import LocalProxyService from "../Proxy/LocalProxyService";


const log = debug('FollowersWorker')

const attemptOptions = {
  maxAttempts: 10,
  delay: 3000,
  factor: 1.2,
  handleError: (error: any, context: any, options: any) => {
    log(`attemptsRemaining: ${context['attemptsRemaining']}`)
    log(error)
  }
}

export default class FollowersWorker {
  proxyService: IProxyService
  requester: Requester
  proxy: string = ''

  constructor() {
    this.proxyService = LocalProxyService.getInstance()

    const cookies = `ig_did=B0B787F1-FFC9-4968-9360-49E87C522A2B; ig_nrcb=1; mid=YGCSRwAEAAF5mYEy03FhLhp4Kkwi; shbid=11211; rur=ASH; shbts=1621855643.8523397; csrftoken=3Lv4TTvntYhY7G4Q0zagNwG5PW55Om3r; ds_user_id=47889665346; sessionid=47889665346%3AUnSNqRagUkQELt%3A8; ig_direct_region_hint=ASH`
    this.requester = Requester.auth(cookies)
  }

  async renewProxy(): Promise<void> {
    this.proxy = await this.proxyService.proxy()
    this.requester.proxy = this.proxy
  }

  async finish(): Promise<void> {
    await this.proxyService.return(this.proxy)
    this.proxy = ''

    return Promise.resolve()
  }

  async *run(followersRequest: IFollowersRequest): AsyncGenerator<IFollower, void, void> {
    const queryHash = `5aefa9893005572d237da5068082d8d5`
    let count = 0

    while (count < followersRequest.limit || followersRequest.limit < 0) {
      const response: IFollowersRequestResponse = await this.requestFollowers(
        this.requester,
        FollowersWorker.getParams(followersRequest, queryHash, followersRequest.after)
      )

      const followers = map(response.nodes, (node) => {
        const latestReelMedia = node.reel.latest_reel_media

        const follower: IFollower = {
          ...pick(
            node,
            ['id', 'username', 'full_name', 'profile_pic_url', 'is_private', 'is_verified']
          ),
          has_reel: latestReelMedia !== 0 && latestReelMedia !== null,
        }

        return follower
      })

      for (let follower of followers) {
        count++

        yield follower

        if (count >= followersRequest.limit && followersRequest.limit >= 0) break
      }

      if (!response.has_next_page) break
      followersRequest.after = response.end_cursor
      log(`After: ${followersRequest.after}`)
    }
  }

  private async requestFollowers(requester: Requester, params: IFollowersRequestParams): Promise<IFollowersRequestResponse> {
    const urlParams = `query_hash=${params['query_hash']}&variables=${encodeURIComponent(JSON.stringify(params['variables']))}`

    return retry(async () => {
      if (isEmpty(this.proxy)) {
        await this.renewProxy()
      }

      let edgeFollowedBy
      try {
        const response = await requester.send({ url: `/graphql/query/?${urlParams}` })
        const body = JSON.parse(response.body)

        edgeFollowedBy = body.data.user.edge_followed_by
      } catch (err) {
        await this.rejectProxy()
        return Promise.reject(err)
      }

      const pageInfo = edgeFollowedBy.page_info
      const nodes = map(edgeFollowedBy.edges, 'node')

      return Promise.resolve({
        nodes,
        count: edgeFollowedBy.count,
        has_next_page: pageInfo.has_next_page,
        end_cursor: pageInfo.end_cursor,
      })
    }, attemptOptions)
  }

  private static getParams(followersRequest: IFollowersRequest, queryHash: string, after?: string): IFollowersRequestParams {
    return {
      query_hash: queryHash,
      variables: {
        id: followersRequest.id,
        include_reel: true,
        first: followersRequest.limit < 0 ? 50 : followersRequest.limit + 1,
        after: after
      }
    }
  }

  private async rejectProxy(): Promise<void> {
    await this.proxyService.reject(this.proxy)
    this.proxy = ''

    return Promise.resolve()
  }
}
