import {IWorkerJob} from "../interfaces"
import debug from "debug";


const log = debug('WorkerJob')

export default class WorkerJob implements IWorkerJob {
  usernames: string[]

  constructor(usernames: string[]) {
    this.usernames = usernames

    log(`Create job with ${this.usernames.length} usernames`)
  }

  getUsername(): string | undefined {
    log(`${this.usernames.length} usernames left`)

    return this.usernames.pop()
  }
}
