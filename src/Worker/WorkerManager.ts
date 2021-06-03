import {IFollower, IFollowerResult, IFollowersRequest, IProfile, IWorkerManager} from "../interfaces"
import ProfileWorker from "./ProfileWorker"
import FollowersWorker from "./FollowersWorker";
import debug from "debug";
import WorkerJob from "./WorkerJob";
import {filter, map } from "lodash";


const log = debug('WorkerManager')

export default class WorkerManager implements IWorkerManager {
  private static instance: WorkerManager

  private constructor() {
  }

  static getInstance(): WorkerManager {
    if (!this.instance) {
      this.instance = new WorkerManager()
    }

    return this.instance
  }

  async getProfile(username: string): Promise<IProfile> {
    const workerJob = new WorkerJob([username])
    const worker = new ProfileWorker('1', workerJob)
    const [profile] = await worker.run()

    if (profile) {
      await worker.finish()

      return Promise.resolve(profile)
    } else {
      return Promise.reject(new Error(`Failed to fetch ${username} profile`))
    }
  }

  async *getFollowers(followersRequest: IFollowersRequest): AsyncGenerator<IFollower, number, void> {
    let total = 0
    const worker = new FollowersWorker()

    for await (let follower of worker.run(followersRequest)) {
      yield follower
    }

    await worker.finish()

    return total
  }

  async filterFollowers(nWorkers: number, followers: IFollower[], followerFilter: (follower: IFollower) => Promise<IFollowerResult>, profileFilter: (profile: IProfile) => Promise<IFollowerResult>, detailed: boolean = false): Promise<IFollowerResult[]> {
    const validFollowers = []
    if (!detailed) {
      for (let follower of followers) {
        const result = await followerFilter(follower)
        if (!result.status) continue

        validFollowers.push(follower)
      }
    }

    const workerJob = new WorkerJob(map(validFollowers, 'username'))
    const threads = []
    for (let i = 1; i <= nWorkers; i++) {
      const worker = new ProfileWorker(i.toString(), workerJob)

      threads.push(worker.run())
    }
    const workerProfiles = await Promise.all(threads)

    let results: IFollowerResult[] = []
    for (let profiles of workerProfiles) {
      log(`Filtering ${profiles.length} profiles`)

      for (let profile of profiles) {
        const result = await profileFilter(profile)
        if (result.status) {
          results.push(result)
        }
      }
    }

    return Promise.resolve(results)
  }
}
