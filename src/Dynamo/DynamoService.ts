import debug from 'debug'
const AWS = require('aws-sdk')

import {
  IDynamoAddFollowersItem, IDynamoFollowersItem, IDynamoGetItem,
  IDynamoService,
} from "./interfaces"


AWS.config.loadFromPath('./resources/aws_config.json')
const dynamodb = new AWS.DynamoDB()


export default class DynamoService implements IDynamoService {
  private readonly log: any

  constructor() {
    this.log = debug('DynamoService')
  }

  async addFollowersItem(addItem: IDynamoAddFollowersItem): Promise<void> {
    const params = {
      Item: {
        id: { S: addItem.item.id },
        maxId: { N: (addItem.item.maxId || 0).toString() }
      },
      TableName: addItem.table
    }

    this.log(`Adding Followers item ${JSON.stringify(addItem.item)} to table ${addItem.table}`)

    return dynamodb.putItem(params).promise()
  }

  async getFollowersItem(getItem: IDynamoGetItem): Promise<IDynamoFollowersItem> {
    this.log(`Getting Followers item ${getItem.id} from table ${getItem.table}`)

    const params = {
      Key: {
        'id': { S: getItem.id }
      },
      TableName: getItem.table,
    }

    const response = await dynamodb.getItem(params).promise()
    this.log(response)

    const {Item} = response
    return Promise.resolve({
      id: Item.id.S,
      maxId: Item.maxId.N,
    })
  }
}
