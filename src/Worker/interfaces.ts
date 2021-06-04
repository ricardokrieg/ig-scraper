import {IJob} from "../Job/interfaces"

export interface IWorker {
  id: string
  run: () => Promise<void>
  getJob: () => Promise<IJob>
  process: (job: IJob) => Promise<void>
}
