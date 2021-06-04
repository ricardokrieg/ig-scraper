export interface IJob {
  receiptHandle: string,
  username: string,
}

export interface IProfileJob extends IJob {
}

export interface IFollowersJob extends IJob {
  after?: string,
  limit?: number,
}

export interface IProfileJobMessage {
  username: string,
}

export interface IFollowersJobMessage {
  username: string,
  after?: string,
  limit?: number,
}

export interface IJobRequest {
  queueUrl: string,
}

export interface IMessage {
  body: any,
  receiptHandle: string,
}

export interface IJobStore {
  getProfileJob: (jobRequest: IJobRequest) => Promise<IProfileJob | undefined>,
  getFollowersJob: (jobRequest: IJobRequest) => Promise<IFollowersJob | undefined>,
  removeJob: (jobRequest: IJobRequest, job: IJob) => Promise<void>,
}
