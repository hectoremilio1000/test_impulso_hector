import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AlterTransactionsStatusColumn extends BaseSchema {
  protected tableName = 'transactions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Ajusta si estaba como varchar(5) u otro
      table.string('status', 20).notNullable().alter()
    })
  }
}
