import {MemoryCookieStore} from "tough-cookie"
import {jar} from "request"
import request from "request-promise"
import {defaultsDeep} from "lodash"
import debug from "debug"

import {IRequester, IRequestOptions} from "./interfaces"
import promiseTimeout from "../Utils/PromiseTimeout"


export default class Requester implements IRequester {
  private readonly log: any

  defaultOptions: any

  private constructor(cookieJar: any = null) {
    let headers
    if (cookieJar) {
      headers = {
        'authority': 'i.instagram.com',
        'accept': '*/*',
        'x-ig-www-claim': 'hmac.AR3waos0XGOI1L3ZVjMb2O8ysNKWKydUogFAwUT38vRbboQ9',
        'x-asbd-id': '437806',
        'user-agent': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 11_2_0 like Mac OS X; en-CA) AppleWebKit/602.5.8 (KHTML, like Gecko) Version/12.1.1 Mobile/8J18a Safari/6533.18.5',
        'x-ig-app-id': '936619743392459',
        'sec-gpc': '1',
        'origin': 'https://www.instagram.com',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://www.instagram.com/',
        'accept-language': 'en-US,en;q=0.9',
      }
    } else {
      headers = {
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
        'User-Agent': `Mozilla/5.0 (iPhone; U; CPU iPhone OS 11_3_5 like Mac OS X; en-US) AppleWebKit/536.18.37 (KHTML, like Gecko) Version/13.1.3 Mobile/8F490 Safari/6533.18.5`,
        'Accept-Language': `en-US,en;q=0.9`,
        'Accept-Encoding': `gzip`,
        'cache-control': `max-age=0`,
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'sec-gpc': '1',
        'upgrade-insecure-requests': '1',
      }
    }

    this.defaultOptions = {
      baseUrl: cookieJar ? 'https://i.instagram.com' : 'https://www.instagram.com',
      jar: cookieJar,
      gzip: true,
      headers: headers,
      method: 'GET',
      resolveWithFullResponse: true,
      timeout: 30000,
    }

    this.log = cookieJar ? debug('Requester:Auth') : debug('Requester:Guest')
  }

  static auth(cookies: string): Requester {
    const cookieStore = new MemoryCookieStore()
    const cookieJar = jar(cookieStore)

    for (let cookie of cookies.split(`;`)) {
      cookieJar.setCookie(cookie, `https://i.instagram.com`)
    }

    return new Requester(cookieJar)
  }

  static guest(): Requester {
    return new Requester()
  }

  async send(options: IRequestOptions) {
    this.log(`[${this.defaultOptions['jar'] ? 'Auth' : 'Guest'}] ${options.proxy} ${options.url}`)

    return await promiseTimeout(30000, request(defaultsDeep({}, options, this.defaultOptions)))
  }
}
