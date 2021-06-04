export interface IScrapeFollowers {
  id: string,
  limit: number,
  cookies: string,
  queryHash: string,
}

export interface IFollowersRequest {
  id: string,
  limit: number,
  after?: string,
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
  followers_count: number,
  following_count: number,
  full_name: string,
  has_clips: boolean,
  has_channel: boolean,
  highlight_reel_count: number,
  id: string,
  is_business_account: boolean,
  is_professional_account: boolean,
  is_joined_recently: boolean,
  is_private: boolean,
  is_verified: boolean,
  profile_pic_url: string,
  username: string,
  post_count: number,
  posts: IPost[],
  igtv_count: number,
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
  detailed: boolean,
}

export interface IScoreResult {
  profile: IProfile,
  score: number,
}

export interface IScorer {
  score: (scoreRequest: IScoreRequest) => Promise<IScoreResult>,
}

export interface IFollowerFilterer {
  name: string,
  check: (follower: IFollower) => boolean
}

export interface IProfileFilterer {
  name: string,
  check: (profile: IProfile) => boolean
}

export interface IProxyResponse {
  address: string,
  check_at: number,
}

export interface IProxyStatus {
  address: string,
  check_at: number,
  status: boolean,
}

export interface IProxyRequest {
  address: string,
  check_at: number,
}

export interface IWorkerManager {
  getProfile: (username: string) => Promise<IProfile>,
}

export interface IWorkerJob {
  getUsername: () => string | undefined,
}

export interface IProxyService {
  proxy: () => Promise<string>,
  reject: (proxy: string) => Promise<void>,
  return: (proxy: string) => Promise<void>,
}

export interface IFollowerResult {
  follower: IFollower,
  status: boolean,
}

export interface FollowerFiltererStatus {
  filterer: IFollowerFilterer,
  count: number,
  failed: number,
}

export interface ProfileFiltererStatus {
  filterer: IProfileFilterer,
  count: number,
  failed: number,
}
