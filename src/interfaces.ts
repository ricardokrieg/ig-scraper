export interface IFollower {
  id: string,
  username: string,
  full_name: string,
  profile_pic_url: string,
  has_anonymous_profile_picture: boolean,
  is_private: boolean,
  is_verified: boolean,
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
