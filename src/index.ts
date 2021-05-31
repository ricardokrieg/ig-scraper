import IGScraper from './IGScraper'
import {IFollower, IProfile, IScrapeFollowers} from './interfaces'
import { map } from 'lodash'
import RealMaleScorer from "./Scorer/RealMaleScorer"
import {FakeProfileFilterer} from "./Filterer/FakeProfileFilterer";

const debugFollowers = async (id: string, limit: number) => {
  const targetFollowers: IScrapeFollowers = {
    id: id,
    limit,
    cookies: `ig_did=B0B787F1-FFC9-4968-9360-49E87C522A2B; ig_nrcb=1; mid=YGCSRwAEAAF5mYEy03FhLhp4Kkwi; shbid=11211; rur=ASH; shbts=1621855643.8523397; csrftoken=3Lv4TTvntYhY7G4Q0zagNwG5PW55Om3r; ds_user_id=47889665346; sessionid=47889665346%3AUnSNqRagUkQELt%3A8; ig_direct_region_hint=ASH`,
    queryHash: `5aefa9893005572d237da5068082d8d5`,
  }
  const igScraper = new IGScraper()

  let followers: IFollower[] = []
  for await (let follower of igScraper.followers(targetFollowers)) {
    followers.push(follower)
  }

  console.log(followers)
  console.log(map(followers, 'username'))
  console.log(`Total: ${followers.length}`)
}

const debugProfile = async (username: string) => {
  const igScraper = new IGScraper()

  const profile: IProfile = await igScraper.profile(username)
  console.log(profile)
}

const debugFakeProfileScore = async (username: string) => {
  const igScraper = new IGScraper()
  const fakeProfileFilterer = new FakeProfileFilterer()

  fakeProfileFilterer.check(await igScraper.profile(username))
}

const debugScore = async (username: string, limit: number, detailed: boolean = true) => {
  const scorer = new RealMaleScorer()
  const result = await scorer.score({ username, limit, detailed })

  console.log(`${(result.score * 100).toFixed(0)}%`)
}

(async() => {
  await debugScore('funkerotico', 100, false)
})()
