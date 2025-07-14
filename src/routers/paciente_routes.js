import {Router} from 'express'
import { detallePaciente, listarPacientes, registrarPaciente, eliminarPaciente, actualizarPaciente, loginPropietario, perfilPropietario } from '../controllers/paciente_controllers.js'
import { verificarTokenJWT } from '../middleware/JWT.js'

const router = Router()

router.post('/paciente/login',loginPropietario)
router.get('/paciente/perfil',verificarTokenJWT,perfilPropietario)

router.post("/paciente/registro",verificarTokenJWT, registrarPaciente)
router.get("/pacientes",verificarTokenJWT,listarPacientes)
router.get("/paciente/:id",verificarTokenJWT, detallePaciente)
router.delete("/paciente/eliminar/:id", verificarTokenJWT,eliminarPaciente)
router.put("/paciente/actualizar/:id", verificarTokenJWT,actualizarPaciente)



export default router