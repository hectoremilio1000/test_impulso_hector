import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Manuals extends BaseSchema {
  protected tableName = 'manuals'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title').notNullable()
      table.text('content', 'longtext').notNullable()
      table.string('position').notNullable()
      // company_id => FK para relacionar a la empresa
      table.integer('company_id').unsigned().nullable().references('id').inTable('companies')
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
