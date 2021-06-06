import SQSJobStore from "../Job/SQSJobStore"
import ProfileProcessor from "../Processor/ProfileProcessor"
import {IProfile} from "../interfaces"


(async () => {
  const dmQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_DMJobs.fifo'

  const jobStore = new SQSJobStore()
  const profileProcessor = await ProfileProcessor.NonFakeMale(jobStore, dmQueueUrl)

  const profile: IProfile = {
    biography: 'Lorem Ipsum',
    external_url: undefined,
    followers_count: 100,
    following_count: 50,
    full_name: 'John Doe',
    has_clips: true,
    has_channel: true,
    highlight_reel_count: 10,
    id: '1',
    is_business_account: false,
    is_professional_account: false,
    is_joined_recently: false,
    is_private: false,
    is_verified: false,
    profile_pic_url: 'http://example.com',
    username: 'johndoe',
    post_count: 0,
    posts: [],
    igtv_count: 5,
  }

  await profileProcessor.process(profile)

  process.exit(0)
})()
