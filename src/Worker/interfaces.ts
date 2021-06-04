import {IJobStore} from "../Job/interfaces"

export interface IWorker {
  id: string
  jobStore: IJobStore
  run: () => Promise<void>
}
