import {Router} from 'express'
import { comprobarTokenPasword, confirmarMail, crearNuevoPassword, login, recuperarPassword, registro } 
from '../controllers/veterinario_controllers.js'

const router = Router()

router.post('/registro', registro)
router.get('/confirmar/:token',confirmarMail)

router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPasword)
router.post('/nuevopassword/:token',crearNuevoPassword)
router.post('/login', login)


export default router