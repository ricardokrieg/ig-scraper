import FollowersWorker from "./FollowersWorker"
import JobStore from "../Job/JobStore"


(async () => {
  const jobStore = new JobStore()
  const jobRequest = { queueUrl: 'https://sqs.us-east-1.amazonaws.com/196763078229/test_FollowersJobs.fifo' }

  const followersWorker = new FollowersWorker('1', jobStore, jobRequest)
  try {
    await followersWorker.run()
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }

  process.exit(0)
})()
