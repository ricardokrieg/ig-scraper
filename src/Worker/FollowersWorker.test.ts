import FollowersWorker from "./FollowersWorker"
import JobStore from "../Job/JobStore"
import FollowersProcessor from "../Processor/FollowersProcessor"


(async () => {
  const followersQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_FollowersJobs.fifo'
  const profileQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_ProfileJobs.fifo'

  const jobStore = new JobStore()
  const followersProcessor = await FollowersProcessor.NonFakeMale(jobStore, profileQueueUrl)
  const jobRequest = { queueUrl: followersQueueUrl }

  const followersWorker = new FollowersWorker('1', jobStore, jobRequest, followersProcessor)
  try {
    await followersWorker.run()
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }

  process.exit(0)
})()
