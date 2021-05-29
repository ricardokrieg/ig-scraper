import {compact, map } from "lodash"
import fs from 'fs'
import debug from "debug"
Promise = require('bluebird')

import Requester from "../Requester"


const log = debug('checkProxies')

const checkProxy = async (requester: Requester, url: string, proxy: string) => {
  try {
    const response = await requester.check({ url, timeout: 2000 }, proxy)

    if (response.statusCode === 200) {
      return proxy
    }
  } catch (err) {
  }

  return undefined
}

(async () => {
  const url = '/lindasbrasileiras20/'
  const requester = Requester.guest()

  const allProxies = fs.readFileSync('resources/proxy.txt').toString().split("\n")
  const proxies = map(allProxies, (proxy) => `http://${proxy}`)

  // @ts-ignore
  const result = await Promise.map(
    proxies.slice(0, 100),
    (proxy: string) => checkProxy(requester, url, proxy),
    { concurrency: 100 })

  const goodProxies = compact(result)
  log(`${goodProxies.length} good proxies:`)
  for (let goodProxy of goodProxies) {
    log(goodProxy)
  }

  await fs.writeFileSync('resources/good_proxies.txt', goodProxies.join("\n"))
})()
