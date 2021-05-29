import {filter, map, sample } from "lodash"
import fs from 'fs'


export default class ProxyService {
  static shared(): string {
    const allProxies = fs.readFileSync('resources/good_proxies.txt').toString().split("\n")
    const proxies = map(allProxies, (proxy) => `http://${proxy.replace(':BR', '')}`)

    return sample(proxies) as string
  }

  static sharedBR(): string {
    const allProxies = fs.readFileSync('resources/proxy_with_geo.txt').toString().split("\n")
    const brProxies = filter(allProxies, (row) => row.includes(':BR'))
    const proxies = map(brProxies, (proxy) => `http://${proxy.replace(':BR', '')}`)

    return sample(proxies) as string
  }
}
