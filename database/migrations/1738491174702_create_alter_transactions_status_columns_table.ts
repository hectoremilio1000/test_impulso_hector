import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AlterTransactionsStatusColumn extends BaseSchema {
  protected tableName = 'transactions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Ajusta si estaba como varchar(5) u otro
      table.string('status', 20).notNullable().alter()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Si quieres revertir al estado anterior (por ejemplo, varchar(5))
      // table.string('status', 5).notNullable().alter()
    })
  }
}
