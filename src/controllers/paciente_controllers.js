import Paciente from "../models/Paciente.js"
import { sendMailToOwner } from "../config/nodemailer.js"
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"
import mongoose from 'mongoose'
import { crearTokenJWT } from "../middleware/JWT.js"

const registrarPaciente = async (req, res) => {
    try {
        console.log("📥 req.body:", req.body);
        console.log("📁 req.files:", req.files);

        const { emailPropietario } = req.body;

        if (Object.values(req.body).includes("")) {
            return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
        }

        const verificarEmailBDD = await Paciente.findOne({ emailPropietario });
        if (verificarEmailBDD) {
            return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" });
        }

        const password = Math.random().toString(36).toUpperCase().slice(2, 5);

        const nuevoPaciente = new Paciente({
            ...req.body,
            passwordPropietario: await Paciente.prototype.encrypPassword("VET"+password),
            veterinario: req.veterinarioBDD._id
        });

        if (req.files?.imagen) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(
                req.files.imagen.tempFilePath,
                { folder: "Pacientes" }
            );
            nuevoPaciente.avatarMascota = secure_url;
            nuevoPaciente.avatarMascotaID = public_id;
            await fs.unlink(req.files.imagen.tempFilePath);
        }

        if (req.body?.avatarMascotaIA) {
            const base64Data = req.body.avatarMascotaIA.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");

            const { secure_url } = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "Pacientes", resource_type: "auto" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(buffer);
            });

            nuevoPaciente.avatarMascotaIA = secure_url;
        }

        await nuevoPaciente.save();

        await sendMailToOwner(emailPropietario, "VET" + password);

        return res.status(201).json({ msg: "Registro exitoso de la mascota y correo enviado al propietario" });

    } catch (error) {
        console.error("❌ ERROR INTERNO:", error);
        return res.status(500).json({ msg: "Error interno del servidor" });
    }
};


const listarPacientes = async (req,res)=>{
    const pacientes = await Paciente.find({estadoMascota:true}).where('veterinario').equals(req.veterinarioBDD).select("-salida -createdAt -updatedAt -__v").populate('veterinario','_id nombre apellido')
    res.status(200).json(pacientes)
}

const detallePaciente = async (req,res) =>{
    //Obtener datos del frontend o cliente rest
    const {id} = req.params
    //Validaciones
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`});
    //Logica del negocio
    const paciente = await Paciente.findById(id).select("-createdAt -updatedAt -__v").populate('veterinario','_id nombre apellido')
    //Responder
    res.status(200).json(paciente)
}

const eliminarPaciente = async (req,res) => {
    const {id} = req.params;

    // Validaciones
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"}); 
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({msg:`Lo sentimos, no existe el paciente ${id}`}); 

    // Lógica del negocio: Actualizar la fecha de salida de la mascota
    const {salidaMascota} = req.body; 
    await Paciente.findByIdAndUpdate(req.params.id, {salidaMascota: salidaMascota}); 

    // Responder
    res.status(200).json({msg:"Fecha de salida de la mascota registrada exitosamente"}); 
}
const actualizarPaciente = async(req,res)=>{
    const {id} = req.params
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    if (req.files?.imagen) {
        const paciente = await Paciente.findById(id)
        if (paciente.avatarMascotaID) {
            await cloudinary.uploader.destroy(paciente.avatarMascotaID);
        }
        const cloudiResponse = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, { folder: 'Pacientes' });
        req.body.avatarMascota = cloudiResponse.secure_url;
        req.body.avatarMascotaID = cloudiResponse.public_id;
        await fs.unlink(req.files.imagen.tempFilePath);
    }
    await Paciente.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json({msg:"Actualización exitosa del paciente"})
}

const loginPropietario = async(req,res)=>{
    console.log(loginPropietario)
    const {email:emailPropietario,password:passwordPropietario} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const pacienteBDD = await Paciente.findOne({emailPropietario})
    if(!pacienteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const verificarPassword = await pacienteBDD.matchPassword(passwordPropietario)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
    const token = crearTokenJWT(pacienteBDD._id,pacienteBDD.rol)
	const {_id,rol} = pacienteBDD
    res.status(200).json({
        token,
        rol,
        _id
    })
}

const perfilPropietario = (req, res) => {
    
    const camposAEliminar = [
        "fechaIngresoMascota", "sintomasMascota", "salidaMascota",
        "estadoMascota", "veterinario", "tipoMascota",
        "fechaNacimientoMascota", "passwordPropietario", 
        "avatarMascota", "avatarMascotaIA","avatarMascotaID", "createdAt", "updatedAt", "__v"
    ]

    camposAEliminar.forEach(campo => delete req.pacienteBDD[campo])

    res.status(200).json(req.pacienteBDD)
}



export{
    registrarPaciente,
    listarPacientes,
    detallePaciente,
    eliminarPaciente,
    actualizarPaciente,
    loginPropietario,
    perfilPropietario
}