import Paciente from "../models/paciente.js"
import { sendMailToOwner } from "../config/nodemailer.js"
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"



const registrarPaciente = async(req,res)=>{
    const {emailPropietario} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Paciente.findOne({emailPropietario})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    const password = Math.random().toString(36).toUpperCase().slice(2, 5)
    const nuevoPaciente = new Paciente({
        ...req.body,
        passwordPropietario: await Paciente.prototype.encrypPassword(password),
        veterinario: req.veterinarioBDD?._id
    })
    if(req.file?.imagen){
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.imagen.tempFilePath,{folder:'Pacientes'})
        nuevoPaciente.avatarMascota = secure_url
        nuevoPaciente.avatarMascotaID = public_id
        await fs.unlink(req.files.imagen.tempFilePath)
    }
    if(req.file?.avatarMascotaIA){
        
    }

    await nuevoPaciente.save()
    await sendMailToOwner(emailPropietario,"VET"+password)
    res.status(201).json({msg:"Registro exitoso de la mascota y correo enviado al propietario"})
}

export{
    registrarPaciente
}