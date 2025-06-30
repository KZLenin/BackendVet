import {Router} from 'express'
import { registrarPaciente } from '../controllers/paciente_controllers.js'
import { verificarTokenJWT } from '../middleware/JWT.js'

const router = Router()


router.post("/paciente/registro", registrarPaciente)



export default router