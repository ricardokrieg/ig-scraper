import {IProfile} from "../interfaces"

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
