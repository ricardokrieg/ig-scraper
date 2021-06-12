import ImageDownloader from "./ImageDownloader"


(async () => {
  const username = 'j_say44'
  const imageUrl = 'https://scontent-mia3-2.cdninstagram.com/v/t51.2885-19/s320x320/39927807_258298575021687_8870587520560136192_n.jpg?tp=1&_nc_ht=scontent-mia3-2.cdninstagram.com&_nc_ohc=ayFgaJ-UsDcAX_uuG4F&edm=ABfd0MgBAAAA&ccb=7-4&oh=3dd557d84cdc03a1d9b265b9e57d3951&oe=60CC1600&_nc_sid=7bff83'

  const imageDownloader = ImageDownloader.getInstance()
  const newImageUrl = await imageDownloader.download(username, imageUrl)

  console.log(newImageUrl)

  process.exit(0)
})()
