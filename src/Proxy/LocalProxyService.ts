import debug from 'debug'
import {sample } from 'lodash'

import {IProxyService} from "./interfaces"


export default class LocalProxyService implements IProxyService {
  private static instance: LocalProxyService
  private readonly log: any

  private readonly proxies: string[]

  private constructor() {
    this.proxies = [
      'http://pnafn:bIaEPtSh@conn4.trs.ai:10688'
    ]

    this.log = debug('LocalProxyService')
  }

  static getInstance(): LocalProxyService {
    if (!this.instance) {
      this.instance = new LocalProxyService()
    }

    return this.instance
  }

  async proxy(): Promise<string> {
    const proxy = <string>sample(this.proxies)

    this.log(proxy)
    if (!proxy) return Promise.reject(new Error('No proxies available'))

    return Promise.resolve(proxy)
  }

  async reject(proxy: string): Promise<void> {
    this.log(`Reject ${proxy}`)

    return Promise.resolve()
  }

  prepare(): Promise<void> {
    return Promise.resolve();
  }
}
