import {filter, isEmpty, map, sample } from "lodash"
import fs from 'fs'
import debug from 'debug'
const AWS = require('aws-sdk')
import {IProxyResponse} from "./interfaces"


const SHARED_PROXY_TABLE = 'SHARED_PROXY'
const MOBILE_PROXY_TABLE = 'MOBILE_PROXY'

const log = debug('ProxyService')

AWS.config.loadFromPath('./resources/aws_config.json')
const dynamodb = new AWS.DynamoDB()
const documentClient = new AWS.DynamoDB.DocumentClient()

export default class ProxyService {
  static async shared(): Promise<string> {
    log('Getting Shared Proxy')

    const params = {
      TableName: SHARED_PROXY_TABLE,
      ProjectionExpression: 'address, check_at',
      FilterExpression: 'check_at = :timestamp',
      ExpressionAttributeValues: {
        ':timestamp': -1,
      },
    }

    const proxies: IProxyResponse[] = (await documentClient.scan(params).promise()).Items

    if (isEmpty(proxies)) {
      return Promise.reject(new Error('No proxy available'))
    }

    return Promise.resolve((sample(proxies) as IProxyResponse).address)
  }
  
  static async mobile(): Promise<string> {
    log('Getting Mobile Proxy')
    
    const randomPort = Math.floor(Math.random() * (60000 - 10000 + 1) + 10000)
    return Promise.resolve(`http://rsproxy.online:${randomPort}`)
  }

  static async notifyBadProxy(proxy: string) {
    log(`Notify bad proxy: ${proxy}`)
    
    if (proxy.includes('rsproxy.online')) return

    const timestamp = Math.floor(new Date().getTime() / 1000) + (10 * 60)

    const params = {
      Item: {
        address: { S: proxy },
        check_at: { N: timestamp.toString() },
      },
      TableName: SHARED_PROXY_TABLE
    }

    await dynamodb.putItem(params).promise()
  }
}
