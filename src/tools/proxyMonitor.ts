import {chunk, countBy, map, shuffle} from "lodash"
import fs from 'fs'
import debug from "debug"
Promise = require('bluebird')
const AWS = require('aws-sdk')

import Requester from "../Requester"
import {IProxyRequest, IProxyResponse, IProxyStatus} from "../interfaces";


const SHARED_PROXY_TABLE = 'SHARED_PROXY'
const MOBILE_PROXY_TABLE = 'MOBILE_PROXY'
const BATCH = 6000
const CONCURRENCY = 300

const log = debug('proxyMonitor')

AWS.config.loadFromPath('./resources/aws_config.json')
const dynamodb = new AWS.DynamoDB()
const documentClient = new AWS.DynamoDB.DocumentClient()

const deleteTable = async () => {
  const params = {
    TableName: SHARED_PROXY_TABLE
  }

  try {
    await dynamodb.deleteTable(params).promise()
  } catch (err) {
    log(err.message)
    return Promise.resolve()
  }
}

const createTable = async () => {
  const params = {
    TableName: SHARED_PROXY_TABLE,
    KeySchema: [
      { AttributeName: 'address', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'address', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  }

  await dynamodb.createTable(params).promise()
}

const addProxies = async (fileName: string) => {
  // await deleteTable()
  // await createTable()

  const proxies = fs.readFileSync(fileName).toString().split("\n")
  const proxiesRequest: IProxyRequest[] = map(proxies, (proxy) => { return { address: `http://${proxy}`, check_at: 0 } })

  await updateProxies(proxiesRequest)
}

const updateProxies = async (proxies: IProxyRequest[]) => {
  for (let chunkProxies of chunk(proxies, 25)) {
    log(`Updating ${chunkProxies.length} proxies...`)

    const requestItems = map(chunkProxies, (proxy) => {
      return {
        PutRequest: {
          Item: {
            address: { 'S': proxy.address },
            check_at: { 'N': proxy.check_at.toString() },
          }
        }
      }
    })

    const params = {
      RequestItems: {
        [SHARED_PROXY_TABLE]: requestItems
      }
    }

    await dynamodb.batchWriteItem(params).promise()
  }
}

const getCheckAtTimestamp = (): number => {
  const timestamp = Math.floor(new Date().getTime() / 1000)

  return timestamp + (60 * 60)
}

const checkProxy = async (requester: Requester, url: string, proxy: string): Promise<IProxyStatus> => {
  try {
    const response = await requester.check({ url, timeout: 5000 }, proxy)

    if (response.statusCode === 200) {
      return Promise.resolve({
        address: proxy,
        check_at: -1,
        status: true,
      })
    }
  } catch (err) {
    log(err.message)
  }

  return Promise.resolve({
    address: proxy,
    check_at: getCheckAtTimestamp(),
    status: false,
  })
}

const monitorProxies = async (requester: Requester, url: string) => {
  const timestamp = Math.floor(new Date().getTime() / 1000)

  const params = {
    TableName: SHARED_PROXY_TABLE,
    ProjectionExpression: 'address, check_at',
    FilterExpression: 'check_at between :beginTimestamp and :endTimestamp',
    ExpressionAttributeValues: {
      ':beginTimestamp': 0,
      ':endTimestamp': timestamp,
    }
  }

  const proxies: IProxyResponse[] = (await documentClient.scan(params).promise()).Items

  // @ts-ignore
  const results = await Promise.map(
    shuffle(proxies).slice(0, BATCH),
    (proxy: IProxyResponse) => checkProxy(requester, url, proxy.address),
    { concurrency: CONCURRENCY })

  log(`${countBy(results, 'status')['true'] || 0} online proxies`)

  await updateProxies(results)
}

(async () => {
  const url = '/lindasbrasileiras20/'
  const requester = Requester.guest()

  // await addProxies('resources/proxy.txt')
  await monitorProxies(requester, url)

  process.exit(0)
})()
