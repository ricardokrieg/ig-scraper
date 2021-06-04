import {isEmpty} from "lodash"
import debug from 'debug'
const AWS = require('aws-sdk')

import {
  IFollowersJob,
  IFollowersJobMessage,
  IJob,
  IJobRequest,
  IJobStore, IMessage,
  IProfileJob,
  IProfileJobMessage
} from "./interfaces"


AWS.config.loadFromPath('./resources/aws_config.json')
const sqs = new AWS.SQS()

const MAX_TRIES = 3


export default class JobStore implements IJobStore {
  private readonly log: any

  constructor() {
    this.log = debug('JobStore')
  }

  async addProfileJob(queueUrl: string, jobMessage: IProfileJobMessage): Promise<void> {
    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(jobMessage),
      MessageDeduplicationId: jobMessage.username,
      MessageGroupId: jobMessage.username,
    }

    this.log(`Adding Profile Job ${JSON.stringify(jobMessage)} to Queue ${queueUrl}`)

    return sqs.sendMessage(params).promise()
  }

  async addFollowersJob(queueUrl: string, jobMessage: IFollowersJobMessage): Promise<void> {
    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(jobMessage),
      MessageDeduplicationId: jobMessage.id,
      MessageGroupId: jobMessage.id,
    }

    this.log(`Adding Followers Job ${JSON.stringify(jobMessage)} to Queue ${queueUrl}`)

    return sqs.sendMessage(params).promise()
  }

  async getProfileJob(jobRequest: IJobRequest): Promise<IProfileJob> {
    const message = await this.getMessage(jobRequest)
    const body = JSON.parse(message.body) as IProfileJobMessage

    const {username} = body

    return Promise.resolve({
      receiptHandle: message.receiptHandle,
      username,
    } as IProfileJob)
  }

  async getFollowersJob(jobRequest: IJobRequest): Promise<IFollowersJob> {
    const message = await this.getMessage(jobRequest)
    const body = JSON.parse(message.body) as IFollowersJobMessage

    const {id, after} = body

    return Promise.resolve({
      receiptHandle: message.receiptHandle,
      id,
      after,
    } as IFollowersJob)
  }

  async removeJob(jobRequest: IJobRequest, job: IJob) {
    const params = {
      QueueUrl: jobRequest.queueUrl,
      ReceiptHandle: job.receiptHandle,
    }

    return sqs.deleteMessage(params).promise()
  }

  private async getMessage(jobRequest: IJobRequest): Promise<IMessage> {
    const params = {
      QueueUrl: jobRequest.queueUrl,
      MaxNumberOfMessages: 1,
    }

    for (let i = 1; i <= MAX_TRIES; i++) {
      const response = await sqs.receiveMessage(params).promise()

      if (isEmpty(response['Messages'])) {
        this.log(`No messages (${MAX_TRIES - i} left)`)

        continue
      }

      const message = response['Messages'][0]

      return Promise.resolve({
        body: message['Body'],
        receiptHandle: message['ReceiptHandle'],
      })
    }

    return Promise.reject()
  }
}
