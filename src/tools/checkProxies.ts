import {compact, map } from "lodash"
import fs from 'fs'
import debug from "debug"
Promise = require('bluebird')

import Requester from "../Requester"


const log = debug('checkProxies')

const checkProxy = async (requester: Requester, url: string, proxy: string) => {
  try {
    const response = await requester.check({ url, timeout: 2000 }, proxy)
    log(`${proxy}: ${response.statusCode}`)
  } catch (err) {
    console.error(`${proxy}: ${err.message}`)
    return undefined
  }

  return proxy
}

(async () => {
  const url = '/lindasbrasileiras20/'
  const requester = Requester.guest()

  const allProxies = fs.readFileSync('resources/proxy.txt').toString().split("\n")
  const proxies = map(allProxies, (proxy) => `http://${proxy}`)

  // @ts-ignore
  const goodProxies = await Promise.map(
    proxies.slice(0, 10),
    (proxy: string) => checkProxy(requester, url, proxy),
    { concurrency: 3 })

  log(`Good proxies:`)
  for (let goodProxy of compact(goodProxies)) {
    log(goodProxy)
  }
})()
