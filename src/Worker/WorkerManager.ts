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

  async filterFollowers(followers: IFollower[], followerFilter: (follower: IFollower) => IFollowerResult, profileFilter: (profile: IProfile) => IFollowerResult, detailed: boolean): Promise<IFollowerResult[]> {
    if (!detailed) {
      followers = filter(followers, (follower) => followerFilter(follower).status)
    }

    const workerJob = new WorkerJob(map(followers, 'username'))
    const worker1 = new ProfileWorker('1', workerJob)
    const worker2 = new ProfileWorker('2', workerJob)
    const worker3 = new ProfileWorker('3', workerJob)
    const worker4 = new ProfileWorker('4', workerJob)

    let threads = [
      worker1.run(),
      worker2.run(),
      worker3.run(),
      worker4.run(),
    ]
    const workerProfiles = await Promise.all(threads)

    let results: IFollowerResult[] = []
    for (let profiles of workerProfiles) {
      log(`Filtering ${profiles.length} profiles`)

      results = [
        ...results,
        ...map(profiles, profileFilter),
      ]
    }

    return Promise.resolve(results)
  }
}
