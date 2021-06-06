import FollowersWorker from "./FollowersWorker"
import FollowersProcessor from "../Processor/FollowersProcessor"
import DynamoService from "../Dynamo/DynamoService"
import SQSJobStore from "../Job/SQSJobStore"


(async () => {
  const profileQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_ProfileJobs.fifo'
  const jobStore = new SQSJobStore()
  const followersProcessor = await FollowersProcessor.NonFakeMale(jobStore, profileQueueUrl)

  const service = new DynamoService()
  const getItem = { table: 'FOLLOWERS', id: '3017325194' }

  const followersWorker = new FollowersWorker('1', service, getItem, followersProcessor)
  await followersWorker.run()

  process.exit(0)
})()
