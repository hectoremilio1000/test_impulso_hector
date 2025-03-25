// app/Jobs/CheckTrialsJob.ts
import Subscription from '#models/subscription'

import { DateTime } from 'luxon'
import { BaseJob } from '../types/job.js'

export default class CheckTrialsJob extends BaseJob {
  public async run() {
    console.log('[CheckTrialsJob] running...')
    const now = DateTime.now()
    const trialSubs = await Subscription.query().where('status', 'trialing')

    for (const sub of trialSubs) {
      // asumiendo que trialEndsAt es un string en la DB,
      // o si lo manejas con @column.dateTime => sub.trialEndsAt es un DateTime
      if (!sub.trialEndsAt) continue

      // Si en tu modelo se define trialEndsAt como DateTime, harás:
      const trialEnd = DateTime.fromJSDate(sub.trialEndsAt.toJSDate?.() || new Date())

      const graceLimit = trialEnd.plus({ days: 5 })
      if (now > graceLimit) {
        sub.status = 'suspended'
        await sub.save()
        console.log(`Subscription ${sub.id} suspended for trial expiry`)
      }
    }
  }
}
