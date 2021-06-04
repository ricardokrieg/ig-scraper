import {map, pick} from "lodash"

import {IPost, IProfile, PostType} from "../interfaces"


export default class ProfileParser {
  static parse(html: string): IProfile {
    const match = /<script type="text\/javascript">window._sharedData = (.*);<\/script>/g.exec(html)

    if (match === null) {
      throw new Error(`Invalid HTML`)
    }

    const data = JSON.parse(match[1])

    try {
      return ProfileParser.profileFromData(data)
    } catch (err) {
      throw new Error(`Flagged proxy`)
    }
  }

  private static profileFromData(data: any): IProfile {
    const profileData = data.entry_data.ProfilePage[0].graphql.user

    return {
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
    })
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
}
