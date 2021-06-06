import SQSJobStore from "./SQSJobStore"
import {IDMJobMessage, IProfileJobMessage} from "./interfaces"


const getProfileJob = async (jobStore: SQSJobStore, queueUrl: string) => {
  const profileJobRequest = { queueUrl }

  const profileJob = await jobStore.getProfileJob(profileJobRequest)
  console.log(profileJob)

  return await jobStore.removeJob(profileJobRequest, profileJob)
}

const getEmptyJob = async (jobStore: SQSJobStore, queueUrl: string) => {
  try {
    const testJobRequest = { queueUrl }

    const testJob = await jobStore.getProfileJob(testJobRequest)
    console.log(testJob)

    return await jobStore.removeJob(testJobRequest, testJob)
  } catch (err) {
    console.error(`No messages`)
  }
}

const addProfileJob = async (jobStore: SQSJobStore, queueUrl: string, jobMessage: IProfileJobMessage) => {
  return await jobStore.addProfileJob(queueUrl, jobMessage)
}

const addDMJob = async (jobStore: SQSJobStore, queueUrl: string, jobMessage: IDMJobMessage) => {
  return await jobStore.addDMJob(queueUrl, jobMessage)
}


(async () => {
  const jobStore = new SQSJobStore()

  const profileJobsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_ProfileJobs.fifo'
  const dmJobsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_DMJobs.fifo'
  const emptyJobsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_Empty.fifo'

  // await getProfileJob(jobStore, profileJobsQueueUrl)
  // await getEmptyJob(jobStore, emptyJobsQueueUrl)

  // await addProfileJob(jobStore, profileJobsQueueUrl, { username: 'lindasbrasileiras20' })
  await addDMJob(jobStore, dmJobsQueueUrl, { username: 'lindasbrasileiras20' })

  process.exit(0)
})()
