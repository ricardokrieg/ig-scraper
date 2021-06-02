import {IPost, IProfile, IProxyService, IWorkerJob, PostType} from "../interfaces"
import Requester from "../Requester"
import {retry} from "@lifeomic/attempt"
import {isEmpty, map, pick} from "lodash"
import debug from "debug"
import SharedProxyService from "../Proxy/SharedProxyService"


let log = debug('ProfileWorker')

const attemptOptions = {
  maxAttempts: 10,
  delay: 3000,
  factor: 1.2,
  handleError: (error: any, context: any, options: any) => {
    log(`attemptsRemaining: ${context['attemptsRemaining']}`)

    if (error.message.includes('No proxies available') || error.message.includes('tunneling socket could not be established') || error.message.includes('560 - ') || error.message.includes('429 - ') || error.message.includes('Timed out in') || error.message.includes('Flagged proxy')) {
      log(error.message)
      return
    }

    log(error)
  }
}

export default class ProfileWorker {
  id: string
  job: IWorkerJob

  proxyService: IProxyService
  requester: Requester
  proxy: string = ''
  log: any

  constructor(id: string, job: IWorkerJob) {
    this.id = id
    this.job = job

    this.proxyService = SharedProxyService.getInstance()
    this.requester = Requester.guest()

    this.log = log.extend(id)
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

  async run(): Promise<IProfile[]> {
    let profiles = []
    let username: string | undefined = undefined

    this.log(`Getting usernames from job...`)

    while (username = this.job.getUsername()) {
      this.log(`Username: ${username}`)
      try {
        const profile = await retry(async () => {
          if (isEmpty(this.proxy)) {
            await this.renewProxy()
            this.log(`Now using proxy ${this.proxy}`)
          }

          let response
          try {
            response = await this.requester.send({ url: `/${username}/` })
          } catch (err) {
            await this.rejectProxy()
            return Promise.reject(err)
          }

          const match = /<script type="text\/javascript">window._sharedData = (.*);<\/script>/g.exec(response.body)

          if (match === null) {
            await this.rejectProxy()
            return Promise.reject(new Error(`Invalid HTML response for profile ${username}`))
          }

          const data = JSON.parse(match[1])
          let profile: IProfile

          try {
            profile = ProfileWorker.profileFromData(data)
          } catch (err) {
            await this.rejectProxy()
            return Promise.reject(new Error(`Flagged proxy ${this.proxy} for profile ${username}`))
          }

          return Promise.resolve(profile)
        }, attemptOptions)

        profiles.push(profile)
      } catch (err) {
        log(`Failed to fetch ${username} after 10 tries`)
      }
    }

    this.log(`Done`)
    return Promise.resolve(profiles)
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

  private async rejectProxy(): Promise<void> {
    this.log(`Rejecting ${this.proxy}`)

    await this.proxyService.reject(this.proxy)
    this.proxy = ''

    return Promise.resolve()
  }
}
