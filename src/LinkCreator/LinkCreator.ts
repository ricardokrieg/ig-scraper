import debug from 'debug'
import request from "request-promise"

import {ILinkCreator} from "./interfaces"


export default class LinkCreator implements ILinkCreator {
  private static instance: LinkCreator
  private readonly log: any

  private readonly token: string = 'aa508b2a58b9a0ffa6bb07e9f39446f4f48f7cf5'

  private constructor() {
    this.log = debug('LinkCreator')
  }

  static getInstance(): LinkCreator {
    if (!this.instance) {
      this.instance = new LinkCreator()
    }

    return this.instance
  }

  generateLongUrl(campaignUrl: string, name: string, username: string, imageUrl: string): string {
    this.log(`Generating long url for name=${name}, username=${username}, imageUrl=${imageUrl}`)

    const cipherName = [...name.split('')].map(char => LinkCreator.encrypt(char)).join('')
    const cipherUsername = [...username.split('')].map(char => LinkCreator.encrypt(char)).join('')

    return `${campaignUrl}?target_name=${cipherName}&target_username=${cipherUsername}&target_image=${imageUrl}`
  }

  async create(longUrl: string): Promise<string> {
    this.log(`Creating short URL for ${longUrl}`)

    const data = {
      'domain': 'bit.ly',
      'long_url': longUrl,
    }

    const options = {
      uri: 'https://api-ssl.bitly.com/v4/shorten',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      json: data,
    }

    const response = await request(options)
    this.log(`Link: ${response['link']}`)

    return Promise.resolve(response['link'])
  }

  private static encrypt(char: string): string {
    const alphabet = [
      '0','1','2','3','4','5','6','7','8','9',
      '.','_',
      'a','b','c','d','e','f',
      'g','h','i','j','k','l',
      'm','n','o','p','q','r',
      's','t','u','v','w','x',
      'y','z',
      'A','B','C','D','E','F',
      'G','H','I','J','K','L',
      'M','N','O','P','Q','R',
      'S','T','U','V','W','X',
      'Y','Z',
    ]
    const shift = 3

    if (!alphabet.includes(char)) {
      return char
    }

    const position = alphabet.indexOf(char)
    const newPosition = (position + shift) % alphabet.length

    return alphabet[newPosition]
  }
}
