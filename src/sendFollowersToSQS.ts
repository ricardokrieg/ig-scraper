import IGScraper from './IGScraper'
import {IFollower, IProfile, IScrapeFollowers} from './interfaces'
import debug from 'debug'
import { map } from 'lodash'
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
  const targetFollowers: IScrapeFollowers = {
    id: profile.id,
    limit: -1,
    cookies: `ig_did=B0B787F1-FFC9-4968-9360-49E87C522A2B; ig_nrcb=1; mid=YGCSRwAEAAF5mYEy03FhLhp4Kkwi; shbid=11211; rur=ASH; shbts=1621855643.8523397; csrftoken=3Lv4TTvntYhY7G4Q0zagNwG5PW55Om3r; ds_user_id=47889665346; sessionid=47889665346%3AUnSNqRagUkQELt%3A8; ig_direct_region_hint=ASH`,
    queryHash: `5aefa9893005572d237da5068082d8d5`,
  }
  const igScraper = new IGScraper()

  const queueUrl = await createQueue(profile)

  let count = 0
  let batch: IFollower[] = []
  for await (let follower of igScraper.followers(targetFollowers)) {
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
  const username = 'sportmilvolts'
  const igScraper = new IGScraper()

  const profile: IProfile = await igScraper.profile(username)

  await sendFollowersToSQS(profile)
})()
