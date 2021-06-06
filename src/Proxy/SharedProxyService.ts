import debug from 'debug'
import {map, uniq} from 'lodash'
const AWS = require('aws-sdk')

import {IProxyResponse, IProxyService} from "./interfaces"

const PROXY_TABLE = 'SHARED_PROXY'

AWS.config.loadFromPath('./resources/aws_config.json')
const dynamodb = new AWS.DynamoDB()
const documentClient = new AWS.DynamoDB.DocumentClient()


export default class SharedProxyService implements IProxyService {
  private static instance: SharedProxyService
  private readonly log: any

  private proxies: string[]

  private constructor() {
    this.proxies = []

    this.log = debug('SharedProxyService')
  }

  static getInstance(): SharedProxyService {
    if (!this.instance) {
      this.instance = new SharedProxyService()
    }

    return this.instance
  }

  async prepare(): Promise<void> {
    return this.getProxiesFromDatabase()
  }

  async proxy(): Promise<string> {
    const proxy = await this.getProxyFromMemory()

    this.log(proxy)
    if (!proxy) return Promise.reject(new Error('No proxies available'))

    return Promise.resolve(proxy)
  }

  async reject(proxy: string): Promise<void> {
    this.log(`Reject ${proxy}`)

    const timestamp = Math.floor(new Date().getTime() / 1000) + (60 * 60)
    const params = {
      Item: {
        address: { S: proxy },
        check_at: { N: timestamp.toString() },
      },
      TableName: PROXY_TABLE
    }

    return dynamodb.putItem(params).promise()
  }

  private async getProxyFromMemory(): Promise<string | undefined> {
    this.log(`Memory has ${this.proxies.length} proxies`)

    if (this.proxies.length < 100) {
      await this.getProxiesFromDatabase()
    }

    return Promise.resolve(this.proxies.pop())
  }

  private async getProxiesFromDatabase(): Promise<void> {
    this.log('Getting proxies from Database...')

    const timestamp = Math.floor(new Date().getTime() / 1000)
    const params = {
      TableName: PROXY_TABLE,
      ProjectionExpression: 'address, check_at',
      FilterExpression: 'check_at <= :timestamp',
      ExpressionAttributeValues: {
        ':timestamp': timestamp,
      },
    }

    const proxies: IProxyResponse[] = (await documentClient.scan(params).promise()).Items
    this.proxies = [
      ...this.proxies,
      ...map(proxies, (proxy: IProxyResponse) => proxy.address)
    ]
    this.proxies = uniq(this.proxies)

    return Promise.resolve()
  }
}
