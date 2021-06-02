import debug from 'debug'
import { reject } from 'lodash'
import {IProxyService} from "../interfaces"


const log = debug('MobileProxyService')

export default class MobileProxyService implements IProxyService {
  private static instance: MobileProxyService

  blacklist: string[]

  private constructor() {
    this.blacklist = []
  }

  static getInstance(): MobileProxyService {
    if (!this.instance) {
      this.instance = new MobileProxyService()
    }

    return this.instance
  }

  async proxy(): Promise<string> {
    let proxy

    while (true) {
      const randomPort = Math.floor(Math.random() * (60000 - 10000 + 1) + 10000)
      proxy = `http://rsproxy.online:${randomPort}`

      if (!this.blacklist.includes(proxy)) break
    }

    log(proxy)
    if (!proxy) return Promise.reject(new Error('No proxies available'))

    this.blacklist = [
      ...this.blacklist,
      proxy
    ]

    return Promise.resolve(proxy)
  }

  async reject(proxy: string): Promise<void> {
    log(`Reject ${proxy}`)

    return Promise.resolve()
  }

  async return(proxy: string): Promise<void> {
    log(`Return ${proxy}`)

    this.blacklist = reject(this.blacklist, (p) => p === proxy)

    return Promise.resolve()
  }
}

