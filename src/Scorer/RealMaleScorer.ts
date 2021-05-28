import {filter, isEmpty} from "lodash"
import Scorer from "./Scorer"
import {IFollower, IScoreRequest, IScrapeFollowers} from "../interfaces"
import IGScraper from "../IGScraper"
import {MaleFollowerFilterer} from "../Filterer/MaleFollowerFilterer"

export default class RealMaleScorer extends Scorer {
  computeScore(scoreRequest: IScoreRequest): Promise<number> {
    const targetFollowers: IScrapeFollowers = {
      id: scoreRequest.profile!.id,
      limit: scoreRequest.limit,
      cookies: `ig_did=B0B787F1-FFC9-4968-9360-49E87C522A2B; ig_nrcb=1; mid=YGCSRwAEAAF5mYEy03FhLhp4Kkwi; shbid=11211; rur=ASH; shbts=1621855643.8523397; csrftoken=3Lv4TTvntYhY7G4Q0zagNwG5PW55Om3r; ds_user_id=47889665346; sessionid=47889665346%3AUnSNqRagUkQELt%3A8; ig_direct_region_hint=ASH`,
      queryHash: `5aefa9893005572d237da5068082d8d5`,
    }

    return new Promise(async resolve => {
      const igScraper = new IGScraper()

      const maleFollowerFilterer = new MaleFollowerFilterer()
      await maleFollowerFilterer.prepare()

      let followers: IFollower[] = await igScraper.followers(targetFollowers)
      if (isEmpty(followers)) return resolve(0)

      const originalCount = followers.length

      followers = filter(followers, (follower) => maleFollowerFilterer.check(follower))
      const score = followers.length / originalCount

      resolve(score)
    })
  }
}
