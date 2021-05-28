import {IProfile, IScorer, IScoreRequest, IScoreResult} from "../interfaces"
import IGScraper from "../IGScraper"
import debug from "debug"


const log = debug('Scorer')

export default abstract class Scorer implements IScorer {
  abstract computeScore(scoreRequest: IScoreRequest): Promise<number>

  async score(scoreRequest: IScoreRequest): Promise<IScoreResult> {
    scoreRequest.profile = await Scorer.getProfileFromRequest(scoreRequest)

    const scoreResult = {
      profile: scoreRequest.profile,
      score: await this.computeScore(scoreRequest)
    }

    return Promise.resolve(scoreResult)
  }

  private static async getProfileFromRequest(scoreRequest: IScoreRequest): Promise<IProfile> {
    if (scoreRequest.profile) return Promise.resolve(scoreRequest.profile)

    const igScraper = new IGScraper()
    const profile = await igScraper.profile(scoreRequest.username!)

    return Promise.resolve(profile)
  }
}
