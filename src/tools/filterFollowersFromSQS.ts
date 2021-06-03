import {IFollower, IFollowerResult, IProfile} from '../interfaces'
import debug from 'debug'
import {countBy, isEmpty, map} from 'lodash'
import RealMaleProcessor from "../Processor/RealMaleProcessor"
import WorkerManager from "../Worker/WorkerManager"
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

const filterFollowersFromSQS = async (profile: IProfile, nWorkers: number, batch: number) => {
  const followersQueueUrl = getQueueUrl(profile)
  const filteredQueueUrl = await createQueue(profile)

  const workerManager = WorkerManager.getInstance()

  const processor = new RealMaleProcessor()
  await processor.prepare()

  let gotMessages = true
  let messages = []
  let receiptHandles: any = {}

  while (gotMessages) {
    gotMessages = false

    for await (let message of getMessages(followersQueueUrl)) {
      gotMessages = true
      messages.push(message)
      receiptHandles[message.follower.id] = message.receiptHandle

      if (messages.length >= batch) break
    }

    log(`Got ${messages.length} messages`)

    const results = await workerManager.filterFollowers(
      nWorkers,
      map(messages, 'follower'),
      (follower: IFollower): Promise<IFollowerResult> => {
        return Promise.resolve({
          follower,
          status: true,
        })
      },
      async (profile: IProfile): Promise<IFollowerResult> => {
        const follower = {
          username: profile.username,
          id: profile.id,
          full_name: profile.full_name,
          profile_pic_url: profile.profile_pic_url,
          is_private: profile.is_private,
          is_verified: profile.is_verified,
          has_reel: false,
        }

        log(`Removing ${follower.username} from Followers Queue`)
        await deleteMessage(followersQueueUrl, receiptHandles[follower.id])

        for (let filterer of processor.profileFilterers) {
          if (!filterer.check(profile)) {
            log(`${follower.full_name} (${follower.username}) FAIL ${filterer.name}`)

            return Promise.resolve({
              follower,
              status: false,
            })
          }
        }

        await addToQueue(filteredQueueUrl, follower)

        return Promise.resolve({
          follower,
          status: true,
        })
      }
    )

    log(`Done`)
    log(`Processed ${results.length} profiles`)
    log(`${countBy(results, 'status')['true'] || 0} followers added to Filtered Queue`)
  }
}

(async() => {
  const [username, nWorkers, batch] = process.argv.slice(2)

  const profile: IProfile = await WorkerManager.getInstance().getProfile(username)

  return filterFollowersFromSQS(profile, nWorkers ? parseInt(nWorkers) : 4, batch ? parseInt(batch) : 100)
})()
