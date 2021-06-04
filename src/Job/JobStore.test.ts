import JobStore from "./JobStore"

(async () => {
  const jobStore = new JobStore()

  const profileJobRequest = { queueUrl: 'https://sqs.us-east-1.amazonaws.com/196763078229/1812831933_filtered.fifo' }
  const profileJob = await jobStore.getProfileJob(profileJobRequest)
  console.log(profileJob)
  await jobStore.removeJob(profileJobRequest, profileJob!)

  const followersJobRequest = { queueUrl: 'https://sqs.us-east-1.amazonaws.com/196763078229/1812831933_followers.fifo' }
  const followersJob = await jobStore.getFollowersJob(followersJobRequest)
  console.log(followersJob)
  await jobStore.removeJob(followersJobRequest, followersJob!)
})()
