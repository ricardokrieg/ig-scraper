import BaseWorker from "./BaseWorker"
import {IJobRequest, IJobStore} from "../Job/interfaces"
import debug from "debug"


export default class ProfileWorker extends BaseWorker {
  private readonly log: any

  constructor(id: string, jobStore: IJobStore, jobRequest: IJobRequest) {
    super(id, jobStore, jobRequest)

    this.log = debug('ProfileWorker').extend(this.id)
  }

  async run(): Promise<void> {
    while (true) {
      try {
        const job = await this.jobStore.getProfileJob(this.jobRequest)

        this.log(`Processing job`)
        this.log(job)

        this.log(`Processed`)
        this.log(`Removing job`)

        await this.jobStore.removeJob(this.jobRequest, job!)
      } catch (err) {
        this.log(`Failed to get job`)
        return Promise.resolve()
      }
    }
  }
}
