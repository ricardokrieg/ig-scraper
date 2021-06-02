import {IFollower, IProfile} from '../interfaces'
import debug from 'debug'
import { map } from 'lodash'
import WorkerManager from "../Worker/WorkerManager"
const AWS = require('aws-sdk')


const log = debug('sendFollowersToSQS')

AWS.config.loadFromPath('./resources/aws_config.json')
const sqs = new AWS.SQS()

const createQueue = async (profile: IProfile): Promise<string> => {
  const queueName = `${profile.id}_followers.fifo`
  const queueUrl = `https://sqs.us-east-1.amazonaws.com/196763078229/${queueName}`

  const params = {
    QueueName: queueName,
    Attributes: {
      'FifoQueue': 'true',
      'VisibilityTimeout': '300',
    }
  }

  log(`Creating Queue ${params.QueueName}...`)

  await sqs.createQueue(params).promise()

  return queueUrl
}

const addToQueue = async (queueUrl: string, followers: IFollower[]) => {
  const entries = map(followers, (follower) => {
    return {
      Id: follower.id,
      MessageBody: JSON.stringify(follower),
      MessageDeduplicationId: follower.id,
      MessageGroupId: follower.id,
    }
  })

  const params = {
    Entries: entries,
    QueueUrl: queueUrl,
  }

  await sqs.sendMessageBatch(params).promise()
}

const sendFollowersToSQS = async (profile: IProfile) => {
  const queueUrl = await createQueue(profile)

  let count = 0
  let batch: IFollower[] = []
  for await (let follower of WorkerManager.getInstance().getFollowers({ id: profile.id, limit: -1 })) {
    batch.push(follower)

    if (batch.length === 10) {
      await addToQueue(queueUrl, batch)
      batch = []
      count += 10

      log(`Added ${count} of ${profile.followers_count} (${((count / profile.followers_count) * 100).toFixed(0)}%)`)
    }
  }

  if (batch.length > 0) {
    await addToQueue(queueUrl, batch)
    count += batch.length

    log(`Added ${count} of ${profile.followers_count} (${((count / profile.followers_count) * 100).toFixed(0)}%)`)
  }
}

(async() => {
  const [username] = process.argv.slice(2)

  const profile: IProfile = await WorkerManager.getInstance().getProfile(username)

  return sendFollowersToSQS(profile)
})()
