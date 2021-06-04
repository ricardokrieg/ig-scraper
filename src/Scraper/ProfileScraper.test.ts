import ProfileScraper from "./ProfileScraper"
import {IProfileScrapeRequest} from "./interfaces"


(async () => {
  const profileScrapeRequest: IProfileScrapeRequest = {
    username: 'lindasbrasileiras20',
    proxy: 'http://obobw:CPDkGFzX@conn4.trs.ai:18033',
  }

  const profileScraper = ProfileScraper.getInstance()

  try {
    const profile = await profileScraper.scrape(profileScrapeRequest)
    console.log(profile)
  } catch (err) {
    console.error(`Failed to scrape: ${profileScrapeRequest.username}`)
    process.exit(1)
  }

  process.exit(0)
})()
