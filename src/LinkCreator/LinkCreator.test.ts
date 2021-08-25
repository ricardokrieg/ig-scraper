import LinkCreator from "./LinkCreator"


(async () => {
  const campaignUrl = 'https://mandanudes.online/go/36ee48ea-ab0a-49ff-b487-949e92cf2372'
  const name = 'natacyane aguiar'
  const username = 'natacyane'
  const imageUrl = 'https://ig-scraper-images.s3.amazonaws.com/natacyane.jpg'

  const linkCreator = LinkCreator.getInstance()
  const longUrl = linkCreator.generateLongUrl(campaignUrl, name, username, imageUrl)
  const url = await linkCreator.create(longUrl)

  console.log(url)

  process.exit(0)
})()
