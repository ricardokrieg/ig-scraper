import JobStore from "./JobStore"
import {IDMJobMessage, IFollowersJobMessage, IProfileJobMessage} from "./interfaces";


const getProfileJob = async (jobStore: JobStore, queueUrl: string) => {
  const profileJobRequest = { queueUrl }

  const profileJob = await jobStore.getProfileJob(profileJobRequest)
  console.log(profileJob)

  return await jobStore.removeJob(profileJobRequest, profileJob)
}

const getFollowersJob = async (jobStore: JobStore, queueUrl: string) => {
  const followersJobRequest = { queueUrl }

  const followersJob = await jobStore.getFollowersJob(followersJobRequest)
  console.log(followersJob)

  return await jobStore.removeJob(followersJobRequest, followersJob)
}

const getEmptyJob = async (jobStore: JobStore, queueUrl: string) => {
  try {
    const testJobRequest = { queueUrl }

    const testJob = await jobStore.getProfileJob(testJobRequest)
    console.log(testJob)

    return await jobStore.removeJob(testJobRequest, testJob)
  } catch (err) {
    console.error(`No messages`)
  }
}

const addProfileJob = async (jobStore: JobStore, queueUrl: string, jobMessage: IProfileJobMessage) => {
  return await jobStore.addProfileJob(queueUrl, jobMessage)
}

const addFollowersJob = async (jobStore: JobStore, queueUrl: string, jobMessage: IFollowersJobMessage) => {
  return await jobStore.addFollowersJob(queueUrl, jobMessage)
}

const addDMJob = async (jobStore: JobStore, queueUrl: string, jobMessage: IDMJobMessage) => {
  return await jobStore.addDMJob(queueUrl, jobMessage)
}


(async () => {
  const jobStore = new JobStore()

  const profileJobsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_ProfileJobs.fifo'
  const followersJobsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_FollowersJobs.fifo'
  const dmJobsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_DMJobs.fifo'
  const emptyJobsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_Empty.fifo'

  // await getProfileJob(jobStore, profileJobsQueueUrl)
  // await getFollowersJob(jobStore, followersJobsQueueUrl)
  // await getEmptyJob(jobStore, emptyJobsQueueUrl)

  // await addProfileJob(jobStore, profileJobsQueueUrl, { username: 'lindasbrasileiras20' })
  // await addFollowersJob(jobStore, followersJobsQueueUrl, { id: '46914837090' })
  await addDMJob(jobStore, dmJobsQueueUrl, { username: 'lindasbrasileiras20' })

  process.exit(0)
})()
