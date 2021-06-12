import {IFollower, IProfile} from "../interfaces"

export interface IRequestOptions {
  proxy: string,
  url: string,
}

export interface IResponse {
  body: string,
  statusCode: number,
}

export interface IRequester {
  send: (options: IRequestOptions) => Promise<IResponse>,
}

export interface IProfileScrapeRequest {
  username: string,
  proxy: string,
}

export interface IProfileScraper {
  scrape: (profileScrapeRequest: IProfileScrapeRequest) => Promise<IProfile>,
}

export interface IFollowersScrapeRequest {
  id: string,
  maxId?: number,
  proxy: string,
}

export interface IFollowersScraper {
  scrape: (profileScrapeRequest: IFollowersScrapeRequest, onScrapedPage: (nextMaxId: number) => Promise<void>, relationshipType: string) => AsyncGenerator<IFollower[], void, void>,
}

export interface IFollowersRequestParams {
  id: string,
  include_reel: boolean,
  first: number,
  after?: string,
}

export interface IFollowersPageInfo {
  has_next_page: boolean,
  end_cursor?: string,
}
