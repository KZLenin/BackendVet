import veterinario from "../models/veterinario.js"
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"

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

    const confirmarMail = async(req,res)=>{
        const token = req.params.token
        const veterinarioBDD = await Veterinario.findOne({token})
        if(!veterinarioBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
        veterinarioBDD.token = null
        veterinarioBDD.confirmEmail=true
        await veterinarioBDD.save()
        res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"})
    }
export{
    registro,
    confirmarMail
}