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

export interface IDMJobMessage {
  username: string,
}

export interface IJobRequest {
  queueUrl: string,
}

export interface IMessage {
  body: any,
  receiptHandle: string,
}

export interface IJobStore {
  addProfileJob: (queueUrl: string, jobMessage: IProfileJobMessage) => Promise<void>,
  addFollowersJob: (queueUrl: string, jobMessage: IFollowersJobMessage) => Promise<void>,
  addDMJob: (queueUrl: string, jobMessage: IDMJobMessage) => Promise<void>,
  getProfileJob: (jobRequest: IJobRequest) => Promise<IProfileJob>,
  getFollowersJob: (jobRequest: IJobRequest) => Promise<IFollowersJob>,
  removeJob: (jobRequest: IJobRequest, job: IJob) => Promise<void>,
}
