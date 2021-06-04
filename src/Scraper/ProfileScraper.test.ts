import ProfileScraper from "./ProfileScraper"


(async () => {
  const profileScrapeRequest = {
    username: 'lindasbrasileiras20',
    proxy: 'http://obobw:CPDkGFzX@conn4.trs.ai:18033',
  }

  const profileScraper = new ProfileScraper()

  try {
    const profile = await profileScraper.scrape(profileScrapeRequest)
    console.log(profile)
  } catch (err) {
    console.error(`Failed to scrape: ${profileScrapeRequest.username}`)
    process.exit(1)
  }

  process.exit(0)
})()
