import { BaseSchema } from '@adonisjs/lucid/schema'

export default class MakePositionNullable extends BaseSchema {
  protected tableName = 'manuals'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Cambiamos la columna position para permitir NULL
      table.string('position').nullable().alter()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revertimos el cambio (volvemos a NOT NULL)
      table.string('position').notNullable().alter()
    })
  }
}
