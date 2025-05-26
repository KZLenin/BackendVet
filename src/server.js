//requerir modulos
import express, { request } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import routerVeterinarios from './routers/veterinario_routes.js'

// Inicializaciones
const app  = express()
dotenv.config()

//Configuraciones
app.set('port', process.env.PORT || 3000) //VariablePrivada||VariablePublica
app.use(cors())

//Middleware
app.use(express.json())

//Rutas
app.get('/',(req,res)=>{
    res.send("Server on")
})
//Rutas para Veterinario
app.use('/api',routerVeterinarios)
//Rutas que no existen
app.use((req,res)=>{res.status(404).send("Endpoint no encontrado")})

export default app