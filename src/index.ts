import IGScraper from './IGScraper'
import {IFollower, IProfile, IScrapeFollowers} from './interfaces'
import { map } from 'lodash'
import RealMaleScorer from "./Scorer/RealMaleScorer"


// (async () => {
//   const targetFollowers: IScrapeFollowers = {
//     // id: '46914837090',
//     id: '27303832309',
//     limit: 100,
//     cookies: `ig_did=B0B787F1-FFC9-4968-9360-49E87C522A2B; ig_nrcb=1; mid=YGCSRwAEAAF5mYEy03FhLhp4Kkwi; shbid=11211; rur=ASH; shbts=1621855643.8523397; csrftoken=3Lv4TTvntYhY7G4Q0zagNwG5PW55Om3r; ds_user_id=47889665346; sessionid=47889665346%3AUnSNqRagUkQELt%3A8; ig_direct_region_hint=ASH`,
//     queryHash: `5aefa9893005572d237da5068082d8d5`,
//   }
//   const igScraper = new IGScraper()
//
//   const followers: IFollower[] = await igScraper.followers(targetFollowers)
//
//   // console.log(map(followers, 'username'))
//   console.log(followers)
//   console.log(`Total: ${followers.length}`)
// })()

// (async () => {
//   const igScraper = new IGScraper()
//
//   const profile = await igScraper.profile('lindasbrasileiras20')
//   // const profile: IProfile = await igScraper.profile('biellgois_.7')
//   console.log(profile)
// })()

(async () => {
  const scorer = new RealMaleScorer()
  const result = await scorer.score({ username: 'lindasbrasileiras20', limit: 100 })

  console.log(result.score)
})()
