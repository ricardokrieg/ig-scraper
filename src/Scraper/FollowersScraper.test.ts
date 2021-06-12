import FollowersScraper from "./FollowersScraper"
import {IFollowersScrapeRequest} from "./interfaces"


(async () => {
  const followersScrapeRequest: IFollowersScrapeRequest = {
    id: '46914837090',
    maxId: 0,
    proxy: 'http://gulgd:AQKCCUGo@conn4.trs.ai:49726',
  }

  const followersScraper = FollowersScraper.getInstance()

  const onScrapedPage = async (nextMaxId: number) => {
    console.log(`next_max_id: ${nextMaxId}`)
  }

  try {
    for await (let followers of followersScraper.scrape(followersScrapeRequest, onScrapedPage)) {
      console.log(followers[0])
      console.log(`And ${followers.length - 1} more`)
    }
  } catch (err) {
    console.error(`Failed to scrape: ${followersScrapeRequest.id}`)
    process.exit(1)
  }

  process.exit(0)
})()
