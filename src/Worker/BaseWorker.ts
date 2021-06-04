import debug from 'debug'

import {IWorker} from "./interfaces"
import {IJobStore, IJobRequest, IJob} from "../Job/interfaces"
import {IProxyService} from "../Proxy/interfaces"

const MAX_SECONDS = 5 * 60


export default abstract class BaseWorker implements IWorker {
  id: string

  protected jobStore: IJobStore
  protected jobRequest: IJobRequest
  protected proxy?: string
  protected proxyService: IProxyService

  protected readonly log: any

  protected constructor(id: string, type: string, jobStore: IJobStore, jobRequest: IJobRequest, proxyService: IProxyService) {
    this.id = id
    this.jobStore = jobStore
    this.jobRequest = jobRequest
    this.proxyService = proxyService

    this.log = debug(type).extend(id)

    if (type !== 'ProfileWorker' && type !== 'FollowersWorker') {
      throw new Error(`Invalid Worker Type: ${type}`)
    }
  }

  abstract process(job: IJob): Promise<void>
  abstract getJob(): Promise<IJob>

  async run(): Promise<void> {
    this.log(`Start`)

    while (true) {
      let job: IJob
      try {
        this.log(`Getting job...`)
        job = await this.getJob()
      } catch (err) {
        this.log(`Failed to get job. Exiting`)
        return Promise.resolve()
      }

      const startTime = Math.floor(new Date().getTime() / 1000)
      this.log(job!)

      let success = false
      while (true) {
        try {
          await this.ensureProxy()
          this.log(`Processing job...`)
          await this.process(job!)

          success = true
          break
        } catch (err) {
          const time = Math.floor(new Date().getTime() / 1000)
          this.log(`Failed to process job. ${time - startTime} seconds elapsed`)

          if (err.message.startsWith('429 - ')) {
            this.log(`Page Not Found (429)`)
          } else {
            this.log(err.message)
          }

          await this.proxyService.reject(this.proxy!)
          this.proxy = undefined

          if ((time - startTime) >= MAX_SECONDS) {
            this.log(`Job expired`)
            break
          }
        }
      }

      if (success) {
        this.log(`Processed`)
        this.log(`Removing job`)

        await this.jobStore.removeJob(this.jobRequest, job!)
      } else {
        return Promise.reject(new Error(`Failed to process job after ${MAX_SECONDS} seconds. Exiting`))
      }
    }
  }

  private async ensureProxy() {
    if (this.proxy) return

    this.log(`Getting new proxy...`)
    this.proxy = await this.proxyService.proxy()
  }
}
