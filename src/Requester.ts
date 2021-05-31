import {MemoryCookieStore} from "tough-cookie"
import {jar} from "request"
import {retry} from "@lifeomic/attempt"
import request from "request-promise"
import {defaultsDeep} from "lodash"
import debug from "debug"

import ProxyService from "./ProxyService"
import {promiseTimeout} from "./utils";


const log = debug('Requester')

const attemptOptions = {
  maxAttempts: 10,
  delay: 3000,
  factor: 1.2,
  handleError: (error: any, context: any, options: any) => {
    log(`attemptsRemaining: ${context['attemptsRemaining']}`)

    if (error.message.includes('tunneling socket could not be established') || error.message.includes('Page Not Found') || error.message.includes('write EPROTO')) {
      log('Proxy error')
      return
    }

    log(error)
  }
}

export default class Requester {
  defaultOptions: any
  proxy: string = ''

  constructor(cookieJar: any = null) {
    const headers = {
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

    this.defaultOptions = {
      baseUrl: 'https://www.instagram.com',
      jar: cookieJar,
      gzip: true,
      headers: headers,
      method: 'GET',
      resolveWithFullResponse: true,
      timeout: 30000,
    }
  }

  static auth(cookies: string): Requester {
    const cookieStore = new MemoryCookieStore()
    const cookieJar = jar(cookieStore)

    for (let cookie of cookies.split(`;`)) {
      cookieJar.setCookie(cookie, `https://www.instagram.com`);
    }

    return new Requester(cookieJar)
  }

  static guest(): Requester {
    return new Requester()
  }

  async send(options: any) {
    return retry(async () => {
      try {
        this.proxy = await ProxyService.getOnlineProxy()

        log(`[${this.defaultOptions['jar'] ? 'Auth' : 'Guest'}] ${options['url']}`)
        log(`Proxy: ${this.proxy}`)

        const response = await request(defaultsDeep({ proxy: this.proxy }, options, this.defaultOptions))
        return Promise.resolve(response)
      } catch (err) {
        if (err.message.includes('tunneling socket could not be established') || err.message.includes('Page Not Found') || err.message.includes('write EPROTO')) {
          await ProxyService.notifyBadProxy(this.proxy)
        }

        throw err
      }
    }, attemptOptions)
  }

  async check(options: any, proxy: string) {
    log(`Check Proxy: ${proxy} => [${this.defaultOptions['jar'] ? 'Auth' : 'Guest'}] ${options['url']}`)

    return promiseTimeout(options.timeout, request(defaultsDeep({ proxy }, options, this.defaultOptions)))
  }
}
