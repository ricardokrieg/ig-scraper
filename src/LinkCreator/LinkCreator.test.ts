import LinkCreator from "./LinkCreator"


(async () => {
  const campaignUrl = 'https://mandanudes.online/test/go/36ee48ea-ab0a-49ff-b487-949e92cf2372'
  const name = 'Jenna Saywell'
  const username = 'j_say44'
  const imageUrl = 'https://ig-scraper-images.s3.amazonaws.com/j_say44.jpg'

  const linkCreator = LinkCreator.getInstance()
  const longUrl = linkCreator.generateLongUrl(campaignUrl, name, username, imageUrl)
  const url = await linkCreator.create(longUrl)

  console.log(url)

  process.exit(0)
})()
