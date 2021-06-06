import SQSJobStore from "../Job/SQSJobStore"
import FollowersProcessor from "../Processor/FollowersProcessor"
import {IFollower} from "../interfaces"


(async () => {
  const profileQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_ProfileJobs.fifo'

  const jobStore = new SQSJobStore()
  const followersProcessor = await FollowersProcessor.NonFakeMale(jobStore, profileQueueUrl)

  const followers: IFollower[] = [
    {
      id: '1',
      username: 'johndoe',
      full_name: 'John Doe',
      profile_pic_url: 'http://example.com/picture.jpg',
      is_private: false,
      is_verified: false,
      has_reel: false,
    }
  ]

  await followersProcessor.process(followers)

  process.exit(0)
})()
