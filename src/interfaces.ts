export interface IScrapeFollowers {
  id: string,
  limit: number,
  cookies: string,
  queryHash: string,
}

export interface IFollower {
  id: string,
  username: string,
  full_name: string,
  profile_pic_url: string,
  is_private: boolean,
  is_verified: boolean,
  has_reel: boolean,
}

export interface IProfile {
  biography: string,
  external_url?: string,
  followers_count: number, // > 100 good
  following_count: number, // < 3000 good
  // followers/following < 0.??? -> fail, followers > following -> good
  full_name: string,
  has_clips: boolean, // good
  has_channel: boolean, // good
  highlight_reel_count: number, // > 0 -> good
  id: string,
  is_business_account: boolean,
  is_professional_account: boolean,
  is_joined_recently: boolean,
  is_private: boolean,
  is_verified: boolean,
  profile_pic_url: string,
  username: string,
  post_count: number, // > 10 -> good
  posts: IPost[], // ??? -> good, ??? -> fail
  igtv_count: number, // > 0 -> good
}

export enum PostType {
  Image,
  Video,
  Carousel,
  Unknown,
}

export interface IPost {
  type: PostType,
  is_video: boolean,
  accessibility_caption?: string,
  comments_disabled: boolean,
  timestamp: number,
  like_count: number,
  comment_count: number,
  view_count?: number,
  has_location: boolean,
}

export interface IFollowersRequestParamsVariables {
  id: string,
  include_reel: boolean,
  first: number,
  after?: string,
}

export interface IFollowersRequestParams {
  query_hash: string,
  variables: IFollowersRequestParamsVariables,
}

export interface IFollowersRequestResponse {
  nodes: any[],
  count: number,
  has_next_page: boolean,
  end_cursor?: string,
}

export interface IScoreRequest {
  profile?: IProfile,
  username?: string,
  limit: number,
}

export interface IScoreResult {
  profile: IProfile,
  score: number,
}

export interface IScorer {
  score: (scoreRequest: IScoreRequest) => Promise<IScoreResult>,
}

export interface IFollowerFilterer {
  check: (follower: IFollower) => boolean
}

export interface IProfileFilterer {
  check: (profile: IProfile) => boolean
}
