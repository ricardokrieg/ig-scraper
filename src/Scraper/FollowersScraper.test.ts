import FollowersScraper from "./FollowersScraper"
import {IFollowersScrapeRequest} from "./interfaces"


(async () => {
  const followersScrapeRequest: IFollowersScrapeRequest = {
    id: '46914837090',
    proxy: 'http://obobw:CPDkGFzX@conn4.trs.ai:18033',
    after: undefined,
  }

  const followersScraper = FollowersScraper.getInstance()

  try {
    for await (let followers of followersScraper.scrape(followersScrapeRequest)) {
      console.log(followers[0])
      console.log(`And ${followers.length - 1} more`)
    }
  } catch (err) {
    console.error(`Failed to scrape: ${followersScrapeRequest.id}`)
    process.exit(1)
  }

  process.exit(0)
})()
