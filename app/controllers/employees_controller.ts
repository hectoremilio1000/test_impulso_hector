// app/Controllers/Http/EmployeesController.ts
import Company from '#models/company'
import Employee from '#models/employee'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class EmployeesController {
  /**
   * GET /api/companies/:companyId/employees
   */
  public async index({ params, response }: HttpContext) {
    try {
      const { companyId } = params
      const employees = await Employee.query()
        .where('company_id', companyId)
        .preload('company')

        .orderBy('id', 'asc')

      return {
        status: 'success',
        data: employees,
      }
    } catch (error) {
      console.error(error)
      return response.internalServerError({
        status: 'error',
        message: 'Error al listar empleados',
      })
    }
  }

  /**
   * GET /api/companies/:companyId/employees/:id
   */
  public async show({ params, response }: HttpContext) {
    try {
      const { companyId, id } = params
      const employee = await Employee.query()
        .where('company_id', companyId)
        .where('id', id)
        .firstOrFail()

      return {
        status: 'success',
        data: employee,
      }
    } catch (error) {
      console.error(error)
      return response.notFound({
        status: 'error',
        message: 'Empleado no encontrado',
      })
    }
  }

  /**
   * POST /api/companies/:companyId/employees
   */
  public async store({ auth, params, request, response }: HttpContext) {
    try {
      const { companyId } = params

      // Verificar que la compañía exista
      await Company.findOrFail(companyId)

      // Leer campos del body
      const data = request.only(['name', 'email', 'phone', 'position', 'password'])

      const newUser = await User.create({
        name: data.name,
        email: data.email,
        password: data.password || '123456', // valor por defecto si no te lo envían
        rol_id: 4, // Ajusta al rol "employee" en tu base de datos
        // whastapp si lo deseas, created_by, etc.
        isActive: true, // en caso de que tengas la default
        created_by: auth.user?.id, // el admin
        whatsapp: data.phone,
      })

      // Crear
      const employee = await Employee.create({
        company_id: companyId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        createdBy: auth.user?.id,
        userId: newUser.id, // Asocia al nuevo User rol=4
      })

      return {
        status: 'success',
        message: 'Empleado y usuario creados correctamente',
        data: { employee, user: newUser },
      }
    } catch (error) {
      console.error('[EmployeesController.store] Error =>', error)
      return response.internalServerError({
        status: 'error',
        message: 'Error al crear empleado y su usuario',
      })
    }
  }

  /**
   * PUT /api/companies/:companyId/employees/:id
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      const { companyId, id } = params

      const employee = await Employee.query()
        .where('company_id', companyId)
        .where('id', id)
        .firstOrFail()

      const data = request.only(['name', 'email', 'phone', 'position'])
      employee.merge(data)
      await employee.save()

      return {
        status: 'success',
        message: 'Empleado actualizado correctamente',
        data: employee,
      }
    } catch (error) {
      console.error(error)
      return response.internalServerError({
        status: 'error',
        message: 'Error al actualizar empleado',
      })
    }
  }

  /**
   * DELETE /api/companies/:companyId/employees/:id
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      const { companyId, id } = params

      // 1) Buscamos el empleado
      const employee = await Employee.query()
        .where('company_id', companyId)
        .where('id', id)
        .firstOrFail()

      // 2) Guardar el userId
      const userId = employee.userId

      // 3) Eliminamos el empleado
      await employee.delete()

      // 4) Marcamos el user como inactivo
      if (userId) {
        const user = await User.find(userId)
        if (user) {
          user.isActive = false
          await user.save()
        }
      }

      return {
        status: 'success',
        message: 'Empleado eliminado y usuario desactivado correctamente',
      }
    } catch (error) {
      console.error(error)
      return response.notFound({
        status: 'error',
        message: 'No se pudo eliminar o no existe',
      })
    }
  }
  public async myEmployee({ auth, response }: HttpContext) {
    try {
      // Tomar el usuario autenticado
      const user = auth.user
      if (!user) {
        return response.unauthorized({
          status: 'error',
          message: 'No se encontró un usuario autenticado.',
        })
      }

      // Buscar el registro Employee que tenga user_id = user.id
      const employee = await Employee.query()
        .where('user_id', user.id)
        .preload('company') // si deseas traer la compañía
        .first()

      if (!employee) {
        return response.notFound({
          status: 'error',
          message: 'No existe un Employee asociado a este usuario.',
        })
      }

      return {
        status: 'success',
        data: employee,
      }
    } catch (error) {
      console.error('[EmployeesController.myEmployee] Error =>', error)
      return response.internalServerError({
        status: 'error',
        message: 'Error al obtener los datos del empleado.',
      })
    }
  }
}
