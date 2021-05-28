import Scorer from "./Scorer"
import {IScoreRequest, IScrapeFollowers} from "../interfaces"
import IGScraper from "../IGScraper"
import {MaleFollowerFilterer} from "../Filterer/MaleFollowerFilterer"
import {NonPrivateFollowerFilterer} from "../Filterer/NonPrivateFollowerFilterer"
import {NonVerifiedFollowerFilterer} from "../Filterer/NonVerifiedFollowerFilterer"
import {ProfilePictureFollowerFilterer} from "../Filterer/ProfilePictureFollowerFilterer"
import {UsernameNameMatchesFollowerFilterer} from "../Filterer/UsernameNameMatchesFollowerFilterer"
import {NonExternalUrlProfileFilterer} from "../Filterer/NonExternalUrlProfileFilterer"
import debug from "debug";


const log = debug('RealMaleScorer')

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
      const nonPrivateFollowerFilterer = new NonPrivateFollowerFilterer()
      const nonVerifiedFollowerFilterer = new NonVerifiedFollowerFilterer()
      const profilePictureFollowerFilterer = new ProfilePictureFollowerFilterer()
      const usernameNameMatchesFollowerFilterer = new UsernameNameMatchesFollowerFilterer()

      const nonExternalUrlProfileFilterer = new NonExternalUrlProfileFilterer()

      let originalCount = 0
      let scoreCount = 0

      for await (let follower of igScraper.followers(targetFollowers)) {
        originalCount++

        if (!nonPrivateFollowerFilterer.check(follower)) continue
        if (!nonVerifiedFollowerFilterer.check(follower)) continue
        if (!profilePictureFollowerFilterer.check(follower)) continue
        if (!usernameNameMatchesFollowerFilterer.check(follower)) continue
        if (!maleFollowerFilterer.check(follower)) continue

        let profile
        try {
          profile = await igScraper.profile(follower.username)
        } catch (err) {
          log(`${follower.full_name} (${follower.username}) Failed to fetch profile`)
          console.error(err)
          continue
        }

        if (!nonExternalUrlProfileFilterer.check(profile)) continue

        scoreCount++
      }

      if (originalCount === 0) return resolve(0)

      resolve(scoreCount / originalCount)
    })
  }
}
