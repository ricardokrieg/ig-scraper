export interface IJob {
  receiptHandle: string,
}

export interface IProfileJob extends IJob {
  username: string,
}

export interface IFollowersJob extends IJob {
  id: string,
  after?: string,
}

export interface IProfileJobMessage {
  username: string,
}

export interface IFollowersJobMessage {
  id: string,
  after?: string,
}

export interface IJobRequest {
  queueUrl: string,
}

export interface IMessage {
  body: any,
  receiptHandle: string,
}

export interface IJobStore {
  getProfileJob: (jobRequest: IJobRequest) => Promise<IProfileJob>,
  getFollowersJob: (jobRequest: IJobRequest) => Promise<IFollowersJob>,
  removeJob: (jobRequest: IJobRequest, job: IJob) => Promise<void>,
}
