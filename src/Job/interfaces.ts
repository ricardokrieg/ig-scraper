export interface IJob {
  receiptHandle: string,
}

export interface IProfileJob extends IJob {
  username: string,
}

export interface IFollowersJob {
  id: string,
  after?: string,
}

export interface IProfileJobMessage {
  username: string,
}

export interface IIPhonePrizesJobMessage {
  full_name: string,
  username: string,
  link: string,
  tagger_name: string,
  tagger_username: string,
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

export interface ISQSJobStore {
  addProfileJob: (queueUrl: string, jobMessage: IProfileJobMessage) => Promise<void>,
  addIPhonePrizesJob: (queueUrl: string, jobMessage: IIPhonePrizesJobMessage) => Promise<void>,
  addDMJob: (queueUrl: string, jobMessage: IDMJobMessage) => Promise<void>,
  getProfileJob: (jobRequest: IJobRequest) => Promise<IProfileJob>,
  removeJob: (jobRequest: IJobRequest, job: IJob) => Promise<void>,
}

export interface IDynamoJobStore {
  addFollowersJob: (job: IFollowersJob) => Promise<void>,
  getFollowersJob: (id: string) => Promise<IFollowersJob>,
}
