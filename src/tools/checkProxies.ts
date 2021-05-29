import {compact, map } from "lodash"
import fs from 'fs'
import Requester from "../Requester";
Promise = require('bluebird')


const checkProxy = async (requester: Requester, url: string, proxy: string) => {
  try {
    await requester.check({ url }, proxy)
  } catch (err) {
    console.error(err.message)
    return undefined
  }

  return proxy
}

(async () => {
  const url = '/lindasbrasileiras20/'
  const requester = Requester.guest()

  const allProxies = fs.readFileSync('resources/proxy.txt').toString().split("\n")
  const proxies = map(allProxies, (proxy) => `http://${proxy}`)

  let promises = []
  for (let proxy of proxies) {
    promises.push(checkProxy(requester, url, proxy))
  }

  const goodProxies = await Promise.all(promises)

  for (let goodProxy of compact(goodProxies)) {
    console.log(goodProxy)
  }
})()
