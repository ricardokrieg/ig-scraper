import {filter, isEmpty, map, sample } from "lodash"
import fs from 'fs'
import debug from 'debug'
const AWS = require('aws-sdk')
import {IProxyResponse} from "./interfaces"


const log = debug('ProxyService')

AWS.config.loadFromPath('./resources/aws_config.json')
const dynamodb = new AWS.DynamoDB()
const documentClient = new AWS.DynamoDB.DocumentClient()

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

  static async getOnlineProxy(): Promise<string> {
    log('Getting online proxy')

    const params = {
      TableName: 'PROXY',
      ProjectionExpression: 'address, check_at',
      FilterExpression: 'check_at = :timestamp',
      ExpressionAttributeValues: {
        ':timestamp': -1,
      },
    }

    const proxies: IProxyResponse[] = (await documentClient.scan(params).promise()).Items

    if (isEmpty(proxies)) {
      return Promise.reject(new Error('No online proxy'))
    }

    return Promise.resolve((sample(proxies) as IProxyResponse).address)
  }

  static async notifyBadProxy(proxy: string) {
    log(`Notify bad proxy: ${proxy}`)

    const timestamp = Math.floor(new Date().getTime() / 1000) + (10 * 60)

    const params = {
      Item: {
        address: { S: proxy },
        check_at: { N: timestamp.toString() },
      },
      TableName: 'PROXY'
    }

    await dynamodb.putItem(params).promise()
  }
}
