import {Router} from 'express'
import { comprobarTokenPasword, confirmarMail, crearNuevoPassword, login, perfil, recuperarPassword, registro, actualizarPerfil, actualizarPassword } 
from '../controllers/veterinario_controllers.js'
import { verificarTokenJWT } from '../middleware/JWT.js'

const router = Router()

router.post('/registro', registro)
router.get('/confirmar/:token',confirmarMail)

router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPasword)
router.post('/nuevopassword/:token',crearNuevoPassword)
router.post('/login', login)

router.get('/perfil', verificarTokenJWT, perfil) //el middleware va en medio de la ruta y el controlador    
router.put('/veterinario/:id',verificarTokenJWT,actualizarPerfil)
router.put('/veterinario/actualizarpassword/:id',verificarTokenJWT,actualizarPassword)



export default router