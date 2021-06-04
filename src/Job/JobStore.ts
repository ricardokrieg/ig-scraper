import {isEmpty} from "lodash"
import debug from 'debug'
const AWS = require('aws-sdk')

import {
  IFollowersJob,
  IFollowersJobMessage,
  IJob,
  IJobRequest,
  IJobStore,
  IProfileJob,
  IProfileJobMessage
} from "./interfaces"


AWS.config.loadFromPath('./resources/aws_config.json')
const sqs = new AWS.SQS()

const log = debug('JobStore')

const MAX_TRIES = 3


interface IMessage {
  body: any,
  receiptHandle: string,
}

export default class JobStore implements IJobStore {
  async getProfileJob(jobRequest: IJobRequest): Promise<IProfileJob | undefined> {
    const message = await this.getMessage(jobRequest)
    const body = message.body as IProfileJobMessage

    const {username} = body

    return Promise.resolve({
      receiptHandle: message.receiptHandle,
      username,
    } as IProfileJob)
  }

  async getFollowersJob(jobRequest: IJobRequest): Promise<IFollowersJob | undefined> {
    const message = await this.getMessage(jobRequest)
    const body = message.body as IFollowersJobMessage

    const {username, after, limit} = body

    return Promise.resolve({
      receiptHandle: message.receiptHandle,
      username,
      after,
      limit,
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
        log(`No messages (${MAX_TRIES - i} left)`)

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
