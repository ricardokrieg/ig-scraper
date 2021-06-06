import SharedProxyService from "../Proxy/SharedProxyService";

Promise = require('bluebird')

import ProfileWorker from "./ProfileWorker"
import JobStore from "../Job/JobStore"
import ProfileProcessor from "../Processor/ProfileProcessor"


(async () => {
  const profileQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_ProfileJobs.fifo'
  const dmQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_DMJobs.fifo'

  await SharedProxyService.getInstance().prepare()

  const jobStore = new JobStore()
  const profileProcessor = await ProfileProcessor.NonFakeMale(jobStore, dmQueueUrl)
  const jobRequest = { queueUrl: profileQueueUrl }

  const threads = []
  for (let i = 1; i <= 300; i++) {
    const worker = new ProfileWorker(i.toString(), jobStore, jobRequest, profileProcessor)

    threads.push(worker.run())
  }

  await Promise.all(threads)

  process.exit(0)
})()
