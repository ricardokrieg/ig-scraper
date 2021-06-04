import ProfileWorker from "./ProfileWorker"
import JobStore from "../Job/JobStore"


(async () => {
  const jobStore = new JobStore()
  const jobRequest = { queueUrl: 'https://sqs.us-east-1.amazonaws.com/196763078229/test_ProfileJobs.fifo' }

  const profileWorker = new ProfileWorker('1', jobStore, jobRequest)
  try {
    await profileWorker.run()
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }

  process.exit(0)
})()
