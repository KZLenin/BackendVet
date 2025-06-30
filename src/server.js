//requerir modulos
import express, { request } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import routerVeterinarios from './routers/veterinario_routes.js'
import routerPacientes from './routers/paciente_routes.js'
import cloudinary from 'cloudinary'
import fileUpload from "express-fileupload"

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
//Ruta para paciente
app.use('/api',routerPacientes)
//Rutas que no existen
app.use((req,res)=>{res.status(404).send("Endpoint no encontrado")})

//Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './uploads'
}))

export default app