import debug from 'debug'
import {map, reject, sample } from 'lodash'
const AWS = require('aws-sdk')
import {IProxyResponse, IProxyService} from "../interfaces"


const PROXY_TABLE = 'SHARED_PROXY'

const log = debug('SharedProxyService')

AWS.config.loadFromPath('./resources/aws_config.json')
const dynamodb = new AWS.DynamoDB()
const documentClient = new AWS.DynamoDB.DocumentClient()

export default class SharedProxyService implements IProxyService {
  private static instance: SharedProxyService

  proxies: string[] = []
  ready: boolean = false

  private constructor() {
  }

  static getInstance(): SharedProxyService {
    if (!this.instance) {
      this.instance = new SharedProxyService()
    }

    return this.instance
  }

  async proxy(): Promise<string> {
    if (!this.ready) {
      await this.loadProxies()
      this.ready = true
    }

    const proxy = <string>sample(this.proxies)

    log(proxy)
    if (!proxy) return Promise.reject(new Error('No proxies available'))

    this.proxies = reject(this.proxies, (p) => p === proxy)

    return Promise.resolve(proxy)
  }

  async reject(proxy: string): Promise<void> {
    log(`Reject ${proxy}`)

    const timestamp = Math.floor(new Date().getTime() / 1000) + (10 * 60)
    const params = {
      Item: {
        address: { S: proxy },
        check_at: { N: timestamp.toString() },
      },
      TableName: PROXY_TABLE
    }

    return dynamodb.putItem(params).promise()
  }

  async return(proxy: string): Promise<void> {
    log(`Return ${proxy}`)

    this.proxies = [
      ...this.proxies,
      proxy
    ]

    return Promise.resolve()
  }

  private async loadProxies() {
    log('Loading proxies...')

    const params = {
      TableName: PROXY_TABLE,
      ProjectionExpression: 'address, check_at',
      FilterExpression: 'check_at = :timestamp',
      ExpressionAttributeValues: {
        ':timestamp': -1,
      },
    }

    const proxies: IProxyResponse[] = (await documentClient.scan(params).promise()).Items

    this.proxies = map(proxies, (proxy: IProxyResponse) => proxy.address)
    log(`Loaded ${this.proxies.length} proxies`)

    return Promise.resolve()
  }
}
