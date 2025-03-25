// app/Controllers/Http/ManualsController.ts

import Company from '#models/company'
import Manual from '#models/manual'
import type { HttpContext } from '@adonisjs/core/http'

export default class ManualsController {
  /**
   * GET /api/manuals
   * Lista todos los manuales. Soporta filtros por ?companyId= y ?position=,
   * para mostrar los manuales asignados a una empresa y/o puesto.
   */
  public async index({ request, response }: HttpContext) {
    try {
      const companyId = request.qs().companyId // ejemplo: /api/manuals?companyId=8
      const position = request.qs().position // ejemplo: /api/manuals?position=Mesero

      const query = Manual.query()

      if (companyId) {
        query.where('company_id', companyId)
      }
      if (position) {
        query.where('position', position)
      }

      const manuals = await query.orderBy('id', 'asc')

      return {
        status: 'success',
        data: manuals,
      }
    } catch (error) {
      console.error('[ManualsController.index]', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al listar manuales',
        error: error.message,
      })
    }
  }

  /**
   * GET /api/manuals/:id
   * Retorna un manual individual (podrías cargar la relación .company si gustas).
   */
  public async show({ params, response }: HttpContext) {
    try {
      const manual = await Manual.findOrFail(params.id)
      // O si deseas: await manual.load('company')  // para traer la empresa

      return {
        status: 'success',
        data: manual,
      }
    } catch (error) {
      console.error('[ManualsController.show]', error)
      return response.status(404).json({
        status: 'error',
        message: 'Manual no encontrado',
      })
    }
  }

  /**
   * POST /api/manuals
   * Crea un nuevo manual.
   * - title, content, position, companyId => lo que necesitamos
   */
  public async store({ request, response }: HttpContext) {
    try {
      const { title, content, position, companyId } = request.only([
        'title',
        'content',
        'position',
        'companyId',
      ])

      // Verificar si la empresa existe (si companyId no es null)
      if (companyId) {
        await Company.findOrFail(companyId)
      }

      const manual = await Manual.create({
        title,
        content,
        position,
        companyId,
      })

      return {
        status: 'success',
        message: 'Manual creado correctamente',
        data: manual,
      }
    } catch (error) {
      console.error('[ManualsController.store]', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al crear manual',
        error: error.message,
      })
    }
  }

  /**
   * PUT /api/manuals/:id
   * Actualiza un manual existente (ej. cambiar el content o asignarlo a otra empresa).
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      const manual = await Manual.findOrFail(params.id)

      const data = request.only(['title', 'content', 'position', 'companyId'])

      if (data.companyId) {
        await Company.findOrFail(data.companyId)
      }

      manual.merge(data)
      await manual.save()

      return {
        status: 'success',
        message: 'Manual actualizado correctamente',
        data: manual,
      }
    } catch (error) {
      console.error('[ManualsController.update]', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al actualizar manual',
        error: error.message,
      })
    }
  }

  /**
   * DELETE /api/manuals/:id
   * Elimina un manual por ID.
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      const manual = await Manual.findOrFail(params.id)
      await manual.delete()

      return {
        status: 'success',
        message: 'Manual eliminado correctamente',
      }
    } catch (error) {
      console.error('[ManualsController.destroy]', error)
      return response.status(404).json({
        status: 'error',
        message: 'No se pudo eliminar manual o no existe',
      })
    }
  }
}
