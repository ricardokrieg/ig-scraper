import FollowersWorker from "./FollowersWorker"
import FollowersProcessor from "../Processor/FollowersProcessor"
import DynamoService from "../Dynamo/DynamoService"
import SQSJobStore from "../Job/SQSJobStore"


(async () => {
  const jobStore = new SQSJobStore()

  // const profileQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_ProfileJobs.fifo'
  // const followersProcessor = await FollowersProcessor.NonFakeMale(jobStore, profileQueueUrl)

  const dmQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/iphonePrizes_DM.fifo'
  const followersProcessor = await FollowersProcessor.Basic(jobStore, dmQueueUrl)

  const service = new DynamoService()
  const getItem = { table: 'FOLLOWERS', id: '2012926467' }

  const followersWorker = new FollowersWorker('1', service, getItem, followersProcessor)
  await followersWorker.run()

  process.exit(0)
})()
