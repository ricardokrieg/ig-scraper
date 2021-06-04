import {IWorker} from "./interfaces"
import {IJobStore, IJobRequest} from "../Job/interfaces"


export default abstract class BaseWorker implements IWorker {
  id: string
  jobStore: IJobStore
  jobRequest: IJobRequest

  protected constructor(id: string, jobStore: IJobStore, jobRequest: IJobRequest) {
    this.id = id
    this.jobStore = jobStore
    this.jobRequest = jobRequest
  }

  abstract run(): Promise<void>
}
