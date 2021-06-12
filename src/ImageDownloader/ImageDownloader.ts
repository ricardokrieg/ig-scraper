import debug from 'debug'
import request from "request-promise"
const AWS = require('aws-sdk')

import {IImageDownloader} from "./interfaces"


AWS.config.loadFromPath('./resources/aws_config.json')
const s3 = new AWS.S3()


export default class ImageDownloader implements IImageDownloader {
  private static instance: ImageDownloader
  private readonly log: any

  private constructor() {
    this.log = debug('ImageDownloader')
  }

  static getInstance(): ImageDownloader {
    if (!this.instance) {
      this.instance = new ImageDownloader()
    }

    return this.instance
  }

  async download(username: string, imageUrl: string): Promise<string> {
    const key = `${username}.jpg`

    this.log(`Downloading ${imageUrl} to ${key}`)

    const options = {
      uri: imageUrl,
      encoding: null,
    }

    const body = await request(options)
    await s3.putObject({
      Body: body,
      Key: key,
      Bucket: 'ig-scraper-images',
      ACL:'public-read',
    }).promise()

    const newImageUrl = `https://ig-scraper-images.s3.amazonaws.com/${key}`
    this.log(`Downloaded to ${newImageUrl}`)

    return Promise.resolve(newImageUrl)
  }
}
