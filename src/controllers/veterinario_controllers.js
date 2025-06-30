import veterinario from "../models/veterinario.js"
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import { crearTokenJWT } from "../middleware/JWT.js"
import mongoose from "mongoose"

const registro = async (req,res) => {
  const {email, password} =req.body
  if(Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, todos los campos son obligatorios"})
  
    const verificarEmailBDD =  await veterinario.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, este email ya se encuentra registrado"})

    const nuevoVeterinario = new veterinario(req.body)
    nuevoVeterinario.password=await nuevoVeterinario.encryPassword(password)

    const token = nuevoVeterinario.crearToken()
    await sendMailToRegister(email,token)
    await nuevoVeterinario.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})
}

const confirmarMail = async (req,res)=>{
    const token = req.params.token
    const veterinarioBDD = await veterinario.findOne({token})
    if(!veterinarioBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    veterinarioBDD.token = null
    veterinarioBDD.confirmEmail=true
    await veterinarioBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"}) 
}


const recuperarPassword = async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await veterinario.findOne({email})
    if(!veterinarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const token = veterinarioBDD.crearToken()
    veterinarioBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}


const comprobarTokenPasword = async (req,res)=>{
    const token = req.params.token
    const veterinarioBDD = await veterinario.findOne({token})
    if(veterinarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await veterinarioBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}


const crearNuevoPassword = async (req,res)=>{
    const{password,confirmpassword} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})
    const veterinarioBDD = await veterinario.findOne({token:req.params.token})
    if(veterinarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    veterinarioBDD.token = null
    veterinarioBDD.password = await veterinarioBDD.encryPassword(password)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 
}

const login = async(req,res) => { 
    const {email, password} = req.body

    if(Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo senimos, debes llenar todos los campos"})
    const veterinarioBDD = await veterinario.findOne({email}).select("-status -__v -token -updatedAt -createdAt")

    if (veterinarioBDD?.confirmEmail === false) return res.status(403).json({msg:"Lo sentimos, debes confirmar tu cuenta antes de iniciar sesion"})

    if (!veterinarioBDD) return res.status(404).json({msg: "Lo sentimos, el usuario no se encuentra registrado"})

    const verificarPassword =  await veterinarioBDD.matchPassword(password)

    if (!verificarPassword) return res.status(401).json({msg:"Lo sentimos, el password es incorrecto"})

    const {nombre, apellido, direccion, celular, _id, rol} = veterinarioBDD

    const token = crearTokenJWT(veterinarioBDD._id,veterinarioBDD.rol)

    res.status(200).json({token, rol, nombre,apellido,direccion,celular,_id})
 }
const perfil =(req,res)=>{
	const {token,confirmEmail,createdAt,updatedAt,__v,...datosPerfil} = req.veterinarioBDD
    res.status(200).json(datosPerfil)
}
const actualizarPerfil = async (req,res)=>{
    const {id} = req.params
    const {nombre,apellido,direccion,celular,email} = req.body
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await veterinario.findById(id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    if (veterinarioBDD.email != email)
    {
        const veterinarioBDDMail = await veterinario.findOne({email})
        if (veterinarioBDDMail)
        {
            return res.status(404).json({msg:`Lo sentimos, el email existe ya se encuentra registrado`})  
        }
    }
    veterinarioBDD.nombre = nombre ?? veterinarioBDD.nombre
    veterinarioBDD.apellido = apellido ?? veterinarioBDD.apellido
    veterinarioBDD.direccion = direccion ?? veterinarioBDD.direccion
    veterinarioBDD.celular = celular ?? veterinarioBDD.celular
    veterinarioBDD.email = email ?? veterinarioBDD.email
    await veterinarioBDD.save()
    console.log(veterinarioBDD)
    res.status(200).json(veterinarioBDD)
}
const actualizarPassword = async (req,res)=>{
    const veterinarioBDD = await veterinario.findById(req.veterinarioBDD._id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    const verificarPassword = await veterinarioBDD.matchPassword(req.body.passwordactual)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
    veterinarioBDD.password = await veterinarioBDD.encrypPassword(req.body.passwordnuevo)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
}



export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    login,
    perfil,
    actualizarPerfil,
    actualizarPassword,
}