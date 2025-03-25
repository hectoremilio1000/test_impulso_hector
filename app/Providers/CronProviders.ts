// app/Providers/CronProvider.ts
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

import Subscription from 'App/Models/Subscription'
import { DateTime } from 'luxon'

export default class CronProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // Se ejecuta durante el boot de la aplicación
    this.startCronJobs()
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }

  private startCronJobs() {
    // 1) CRON para trial + gracia
    cron.schedule('0 1 * * *', async () => {
      await this.checkTrials()
    })

    // 2) CRON para resetear coaching horas (p.ej día 1 del mes a las 00:05)
    cron.schedule('5 0 1 * *', async () => {
      await this.resetCoachingHours()
    })
  }

  private async checkTrials() {
    console.log('checkTrials CRON running...')
    const now = DateTime.now()
    const trialSubs = await Subscription.query().where('status', 'trialing')

    for (const sub of trialSubs) {
      if (sub.trialEndsAt) {
        const trialEnd = DateTime.fromSQL(sub.trialEndsAt) // o fromISO, depende el formato
        const graceLimit = trialEnd.plus({ days: 5 })
        if (now > graceLimit) {
          sub.status = 'suspended'
          await sub.save()
          console.log(`Subscription ${sub.id} suspended for trial expiry`)
        }
      }
    }
  }

  private async resetCoachingHours() {
    console.log('resetCoachingHours CRON running...')
    const subs = await Subscription.query().whereIn('status', ['active', 'trialing'])
    for (const s of subs) {
      s.coachingUsed = 0
      await s.save()
    }
    console.log(`Reset coaching hours for ${subs.length} subscriptions`)
  }
}
