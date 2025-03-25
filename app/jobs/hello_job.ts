// app/jobs/hello_job.ts

import { BaseJob } from '../types/job.js'

export default class HelloJob extends BaseJob {
  public async run() {
    console.log('¡Hola! HelloJob se ejecuta ahora.')
    // Simula un trabajo de 30 segundos
    await new Promise((resolve) => setTimeout(resolve, 30000))
    console.log('HelloJob finalizado.')
  }
}
