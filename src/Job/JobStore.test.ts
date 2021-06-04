import JobStore from "./JobStore"


(async () => {
  const jobStore = new JobStore()

  const profileJobRequest = { queueUrl: 'https://sqs.us-east-1.amazonaws.com/196763078229/test_ProfileJobs.fifo' }
  const profileJob = await jobStore.getProfileJob(profileJobRequest)
  console.log(profileJob)
  await jobStore.removeJob(profileJobRequest, profileJob)

  const followersJobRequest = { queueUrl: 'https://sqs.us-east-1.amazonaws.com/196763078229/test_FollowersJobs.fifo' }
  const followersJob = await jobStore.getFollowersJob(followersJobRequest)
  console.log(followersJob)
  await jobStore.removeJob(followersJobRequest, followersJob)

  try {
    const testJobRequest = { queueUrl: 'https://sqs.us-east-1.amazonaws.com/196763078229/test_Empty.fifo' }
    const testJob = await jobStore.getProfileJob(testJobRequest)
    console.log(testJob)
    await jobStore.removeJob(testJobRequest, testJob)
  } catch (err) {
    console.error(`No messages`)
  }

  process.exit(0)
})()
