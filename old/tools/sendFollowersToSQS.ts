import {IFollower, IFollowersRequest, IProfile} from '../interfaces'
import debug from 'debug'
import {isEmpty, map } from 'lodash'
import WorkerManager from "../Worker/WorkerManager"
import RealMaleProcessor from "../Processor/RealMaleProcessor";
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
      'VisibilityTimeout': '1800',
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

const sendFollowersToSQS = async (profile: IProfile, after: string | undefined) => {
  const followersRequest: IFollowersRequest = {
    id: profile.id,
    limit: -1,
    after: isEmpty(after) ? '' : after,
  }

  const queueUrl = await createQueue(profile)

  const processor = new RealMaleProcessor()
  await processor.prepare()

  let totalCount = 0
  let count = 0
  let batch: IFollower[] = []
  for await (let follower of WorkerManager.getInstance().getFollowers(followersRequest)) {
    let shouldAdd = true
    for (let filterer of processor.followerFilterers) {
      if (!filterer.check(follower)) {
        log(`${follower.full_name} (${follower.username}) FAIL ${filterer.name}`)

        shouldAdd = false
        break
      }
    }
    totalCount++
    if (!shouldAdd) continue
    count++

    log(`${follower.full_name} (${follower.username}) PASS`)
    batch.push(follower)

    if (batch.length === 10) {
      await addToQueue(queueUrl, batch)
      batch = []

      log(`Processed ${totalCount} of ${profile.followers_count} (${((totalCount / profile.followers_count) * 100).toFixed(0)}%)`)
      log(`Added ${count} (${((count / totalCount) * 100).toFixed(0)}%)`)
    }
  }

  if (batch.length > 0) {
    await addToQueue(queueUrl, batch)

    log(`Processed ${totalCount} of ${profile.followers_count} (${((totalCount / profile.followers_count) * 100).toFixed(0)}%)`)
    log(`Added ${count} (${((count / totalCount) * 100).toFixed(0)}%)`)
  }
}

(async() => {
  const [username, after] = process.argv.slice(2)

  const profile: IProfile = await WorkerManager.getInstance().getProfile(username)

  return sendFollowersToSQS(profile, after)
})()
