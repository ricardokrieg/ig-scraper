import {map, pick} from 'lodash'

import Requester from './Requester'
import {
  IFollower,
  IFollowersRequestParams,
  IFollowersRequestResponse,
  IPost,
  IProfile,
  IScrapeFollowers,
  PostType,
} from './interfaces'

export default class IGScraper {
  async profile(username: string): Promise<IProfile> {
    const guestRequester = Requester.guest()

    const data = await IGScraper.requestProfile(guestRequester, username)

    const profile: IProfile = IGScraper.profileFromData(data)

    return Promise.resolve(profile)
  }

  async *followers(targetFollowers: IScrapeFollowers): AsyncGenerator<IFollower, void, void> {
    const authRequester = Requester.auth(targetFollowers.cookies)

    let after = undefined
    let count = 0

    while (count < targetFollowers.limit) {
      const response: IFollowersRequestResponse = await IGScraper.requestFollowers(authRequester, IGScraper.getParams(targetFollowers, after))

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

        if (count >= targetFollowers.limit) break
      }

      if (!response.has_next_page) break
      after = response.end_cursor
    }
  }

  private static async requestFollowers(requester: Requester, params: IFollowersRequestParams): Promise<IFollowersRequestResponse> {
    const urlParams = `query_hash=${params['query_hash']}&variables=${encodeURIComponent(JSON.stringify(params['variables']))}`

    const response = await requester.send({ url: `/graphql/query/?${urlParams}` })
    const body = JSON.parse(response.body)

    const edgeFollowedBy = body.data.user.edge_followed_by
    const pageInfo = edgeFollowedBy.page_info
    const nodes = map(edgeFollowedBy.edges, 'node')

    return Promise.resolve({
      nodes,
      count: edgeFollowedBy.count,
      has_next_page: pageInfo.has_next_page,
      end_cursor: pageInfo.end_cursor,
    })
  }

  private static async requestProfile(requester: Requester, username: string): Promise<any> {
    const response = await requester.send({ url: `/${username}/` })
    const match = /<script type="text\/javascript">window._sharedData = (.*);<\/script>/g.exec(response.body)

    if (match === null) {
      throw "Invalid"
    }

    return Promise.resolve(JSON.parse(match[1]))
  }

  private static profileFromData(data: any): IProfile {
    const profileData = data.entry_data.ProfilePage[0].graphql.user

    const profile = {
      ...pick(profileData, [
        'biography',
        'external_url',
        'full_name',
        'has_clips',
        'has_channel',
        'highlight_reel_count',
        'id',
        'is_business_account',
        'is_professional_account',
        'is_joined_recently',
        'is_private',
        'is_verified',
        'profile_pic_url',
        'username',
      ]),
      followers_count: profileData.edge_followed_by.count,
      following_count: profileData.edge_follow.count,
      post_count: profileData.edge_owner_to_timeline_media.count,
      igtv_count: profileData.edge_felix_video_timeline.count,
      posts: this.postsFromProfileData(profileData),
    }

    return profile as IProfile;
  }

  private static postsFromProfileData(profileData: any): IPost[] {
    return map(profileData.edge_owner_to_timeline_media.edges, (nodeContainer) => {
      const node = nodeContainer.node

      return {
        ...pick(node, [
          'is_video',
          'accessibility_caption',
          'comments_disabled',
        ]),
        type: this.getPostType(node.__typename),
        timestamp: node.taken_at_timestamp,
        has_location: node.location !== null,
        like_count: node.edge_liked_by.count,
        comment_count: node.edge_media_to_comment.count,
        view_count: node.video_view_count,
      }
    }) as IPost[]
  }

  private static getPostType(type: string): PostType {
    switch (type) {
      case 'GraphImage':
        return PostType.Image
      case 'GraphVideo':
        return PostType.Video
      case 'GraphSidecar':
        return PostType.Carousel
      default:
        return PostType.Unknown
    }
  }

  private static getParams(targetFollowers: IScrapeFollowers, after?: string): IFollowersRequestParams {
    return {
      query_hash: targetFollowers.queryHash,
      variables: {
        id: targetFollowers.id,
        include_reel: true,
        first: targetFollowers.limit + 1,
        after: after
      }
    }
  }
}
