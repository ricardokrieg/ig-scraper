import {IFollower, IProfile, IScorer, IScoreRequest, IScoreResult} from "../interfaces"
// import IGScraper from "../IGScraper"
import debug from "debug"
import WorkerManager from "../Worker/WorkerManager";


const log = debug('Scorer')

export default abstract class Scorer implements IScorer {
  protected followers: IFollower[] = []

  abstract computeScore(scoreRequest: IScoreRequest): Promise<number>

  async score(scoreRequest: IScoreRequest): Promise<IScoreResult> {
    scoreRequest.profile = await Scorer.getProfileFromRequest(scoreRequest)
    log(`${scoreRequest.profile.full_name} (${scoreRequest.profile.username})`)

    this.followers = []
    for await (let follower of WorkerManager.getInstance().getFollowers({ id: scoreRequest.profile.id, limit: scoreRequest.limit })) {
      this.followers.push(follower)
    }

    log(`${this.followers.length} followers`)

    const scoreResult = {
      profile: scoreRequest.profile,
      score: await this.computeScore(scoreRequest)
    }

    return Promise.resolve(scoreResult)
  }

  private static async getProfileFromRequest(scoreRequest: IScoreRequest): Promise<IProfile> {
    if (scoreRequest.profile) return Promise.resolve(scoreRequest.profile)

    return WorkerManager.getInstance().getProfile(scoreRequest.username!)
  }
}
