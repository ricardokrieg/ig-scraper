import IGScraper from './IGScraper'
import {IFollower, IProfile} from './interfaces'
import debug from 'debug'
import {countBy, isEmpty, map} from 'lodash'
import RealMaleProcessor from "./Processor/RealMaleProcessor";
Promise = require('bluebird')
const AWS = require('aws-sdk')


const log = debug('filterFollowersFromSQS')

AWS.config.loadFromPath('./resources/aws_config.json')
const sqs = new AWS.SQS()

interface IFollowerMessage {
  follower: IFollower,
  receiptHandle: string,
}

const getQueueUrl = (profile: IProfile): string => {
  const queueName = `${profile.id}_followers.fifo`
  return `https://sqs.us-east-1.amazonaws.com/196763078229/${queueName}`
}

async function *getMessages(queueUrl: string): AsyncGenerator<IFollowerMessage, void, void> {
  const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
  }

  let tries = 3
  while (tries > 0) {
    const response = await sqs.receiveMessage(params).promise()

    if (isEmpty(response['Messages'])) {
      log(`No messages (${tries} left)`)

      tries--
      continue
    }
    tries = 3

    for (let message of response['Messages']) {
      yield {
        follower: JSON.parse(message['Body']) as IFollower,
        receiptHandle: message['ReceiptHandle']
      }
    }
  }
}

const deleteMessage = async (queueUrl: string, receiptHandle: string) => {
  const params = {
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle
  }

  return sqs.deleteMessage(params).promise()
}

const addToQueue = async (queueUrl: string, follower: IFollower) => {
  const {id, username, full_name} = follower

  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({ id, username, full_name }),
    MessageDeduplicationId: follower.id,
    MessageGroupId: follower.id,
  }

  log(`Adding ${follower.username} to SQS queue`)

  await sqs.sendMessage(params).promise()
}

const filterFollower = async (processor: RealMaleProcessor, message: IFollowerMessage, followersQueueUrl: string, filteredQueueUrl: string): Promise<boolean> => {
  const {follower, receiptHandle} = message
  const result = await processor.process(follower)

  log(`${follower.full_name} (${follower.username}) ${result ? 'PASS' : 'FAIL'}`)

  if (result) {
    await addToQueue(filteredQueueUrl, follower)
  }

  await deleteMessage(followersQueueUrl, receiptHandle)

  return Promise.resolve(result)
}

const createQueue = async (profile: IProfile): Promise<string> => {
  const queueName = `${profile.id}_filtered.fifo`
  const queueUrl = `https://sqs.us-east-1.amazonaws.com/196763078229/${queueName}`

  const params = {
    QueueName: queueName,
    Attributes: {
      'FifoQueue': 'true',
      'VisibilityTimeout': '1800',
    }
  }

  log(`Creating Queue ${params.QueueName}...`)

  await sqs.createQueue(params).promise()

  return queueUrl
}

const filterFollowersFromSQS = async (profile: IProfile) => {
  const followersQueueUrl = getQueueUrl(profile)
  const filteredQueueUrl = await createQueue(profile)

  const processor = new RealMaleProcessor()
  await processor.prepare()

  const promises = []
  for await (let message of getMessages(followersQueueUrl)) {
    log(message)

    promises.push(filterFollower(processor, message, followersQueueUrl, filteredQueueUrl))
    log(`Processing ${promises.length}`)

    if (promises.length >= 1000) break
  }

  log(`Waiting promises...`)
  const results = await Promise.all(promises)
  log(`Done`)
  log(`${countBy(results)['true']} valid followers`)
}

(async() => {
  const username = 'jaine_cassu'
  const igScraper = new IGScraper()

  const profile: IProfile = await igScraper.profile(username)

  await filterFollowersFromSQS(profile)
})()
