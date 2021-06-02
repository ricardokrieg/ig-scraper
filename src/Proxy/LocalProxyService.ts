import debug from 'debug'
import {reject, sample } from 'lodash'
import {IProxyService} from "../interfaces"


const log = debug('LocalProxyService')

export default class LocalProxyService implements IProxyService {
  private static instance: LocalProxyService

  proxies: string[]

  private constructor() {
    this.proxies = [
      'http://obobw:CPDkGFzX@conn4.trs.ai:18033'
    ]
  }

  static getInstance(): LocalProxyService {
    if (!this.instance) {
      this.instance = new LocalProxyService()
    }

    return this.instance
  }

  async proxy(): Promise<string> {
    const proxy = <string>sample(this.proxies)

    log(proxy)
    if (!proxy) return Promise.reject(new Error('No proxies available'))

    this.proxies = reject(this.proxies, (p) => p === proxy)

    return Promise.resolve(proxy)
  }

  async reject(proxy: string): Promise<void> {
    log(`Reject ${proxy}`)

    return Promise.resolve()
  }

  async return(proxy: string): Promise<void> {
    log(`Return ${proxy}`)

    this.proxies = [
      ...this.proxies,
      proxy
    ]

    return Promise.resolve()
  }
}
